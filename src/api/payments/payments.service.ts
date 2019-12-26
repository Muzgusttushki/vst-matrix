import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPaymentSchema } from './Schemas/IPaymentSchema';
import { Model } from 'mongoose';
import { IActionSchema } from '../../services/actions/Schemas/IActionSchema';
import { ObjectID } from 'bson';
import { LocaleDate } from 'src/utils/LocaleDate';
import { IStaticFilterNumber } from './Schemas/Types/IStaticFIlterNumber';
import { IAssembledFilterSchema } from './Schemas/IAssembledFilterSchema';
import { tz } from 'moment-timezone';
import { IEchoDefault } from './DTO/IEchoDefault';
import { UserListDTO } from './DTO/Microservices/UserListDTO';

@Injectable()
export class PaymentsService {
    private _filterGenericLoop: Boolean = false;

    constructor(@InjectModel('t_payments') private readonly paymentSchema: Model<IPaymentSchema>,
        @InjectModel('buyers') private readonly actionSchema: Model<IActionSchema>,
        @InjectModel('t_paymentsFilters') private readonly paymentFiltersSchema: Model<IAssembledFilterSchema>) {

        this.UpdateInner();
        // this.ChangeDates();
    }

    async ChangeDates() {
        const length = await this.actionSchema.countDocuments({ date: { $exists: true, $ne: null } }).exec();
        const left = Math.floor(length / 20000);

        for (let offset = 9; offset <= left; offset++) {
            console.log("chunk is", offset);
            const actions = await this.actionSchema.find({ date: { $exists: true, $ne: null } })
                .sort({ date: -1 })
                .skip(offset * 20000)
                .limit(20000)
                .exec();


            for (let index in actions) {
                const action = actions[index];

                await this.actionSchema.updateOne({
                    _id: new ObjectID(action._id)
                }, { date: tz(action.date, "Europe/Moscow").toDate() }).exec()
                    .then(() => {
                        console.log("user update", index, action._id)
                        console.log(`${action.date}->${tz(action.date, "Europe/Moscow").toDate()}`)
                    })
            }
        }
    }

    async Buyers(stage: UserListDTO, interval: {
        second: Date,
        primary: Date
    }, access: String[]) {
        const _filters = [];

        if (stage.cities && stage.cities.length)
            _filters.push({ "transaction.city": { $in: stage.cities } });

        if (stage.events && stage.events.length)
            _filters.push({ "transaction.event": { $in: stage.events } });

        _filters.push({ lastTransactionTime: { $gte: interval.primary, $lte: interval.second } });
        _filters.push({ access: { $in: access } });
        _filters.push({ $gte: [{ $size: "$transactions" }, stage.transactionQunatity[0]] });
        _filters.push({ $lte: [{ $size: "$transactions" }, stage.transactionQunatity[1]] });
        _filters.push({ tickets: { $gte: stage.ticketQuantity[0], $lte: stage.ticketQuantity[1] } });
        _filters.push({ earnings: { $gte: stage.earnings[0], $lte: stage.earnings[1] } });
        _filters.push({
            averageEarnings: {
                $gte: stage.averageEarnings[0],
                $lte: stage.averageEarnings[1]
            }
        });

        const _db_req = this.paymentSchema.aggregate([]);
        _db_req.match({ $and: _filters });
        _db_req.sort({ lastTransactionTime: -1 });
        _db_req.limit(100);
        _db_req.exec();
    }

    async Filters(primaryAssembledTime: Date, secondAssembledTime: Date, access: String[]): Promise<IEchoDefault<Object>> {
        const request = this.paymentFiltersSchema.aggregate([]);
        const stage: { error: { message: String } } | { then: Object } = await request
            .match({ date: { $gte: primaryAssembledTime, $lte: secondAssembledTime }, access: { $in: access } })
            .group({
                _id: null,

                minEarnings: { $min: "$minEarnings" },
                maxEarnings: { $max: "$maxEarnings" },

                minAverageEarnings: { $min: "$minAverageEarnings" },
                maxAverageEarnings: { $max: "$maxAverageEarnings" },

                minTicketQuantity: { $max: "$minTicketQuantity" },
                maxTicketQuantity: { $min: "$maxTicketQuantity" },

                minTransactionsQuantity: { $min: "$minTransactionsQuantity" },
                maxTransactionsQuantity: { $max: "$maxTransactionsQuantity" }
            })
            .lookup({
                from: "t_paymentsfilters",
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ['$date', primaryAssembledTime] },
                                { $lte: ['$date', secondAssembledTime] },
                                { $in: ['$access', access] }
                            ]
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        cities: { $push: "$cities" }
                    },
                },
                {
                    $addFields: {
                        cities: {
                            $reduce: {
                                input: '$cities',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] },
                            }
                        }
                    }
                },
                { $unwind: "$cities" }, {
                    $group: {
                        _id: "$cities.label",
                        quantity: { $sum: "$cities.quantity" }
                    }
                }, { $sort: { quantity: -1 } }, {
                    $project: {
                        _id: false,
                        label: "$_id",
                        quantity: true
                    }
                }],
                as: "cities"
            })
            .lookup({
                from: "t_paymentsfilters",
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $gte: ['$date', primaryAssembledTime] },
                                { $lte: ['$date', secondAssembledTime] },
                                { $in: ['$access', access] }
                            ]
                        }
                    }
                }, {
                    $group: {
                        _id: null,
                        events: { $push: "$events" }
                    },
                },
                {
                    $addFields: {
                        events: {
                            $reduce: {
                                input: '$events',
                                initialValue: [],
                                in: { $concatArrays: ['$$value', '$$this'] },
                            }
                        }
                    }
                },
                { $unwind: "$events" }, {
                    $group: {
                        _id: "$events.label",
                        quantity: { $sum: "$events.quantity" }
                    }
                }, { $sort: { quantity: -1 } }, {
                    $project: {
                        _id: false,
                        label: "$_id",
                        quantity: true
                    }
                }],
                as: "events"
            })
            .exec()
            .then((resolve: { then: Object }) => {
                return {
                    then: resolve[0] || {}
                }
            })
            .catch((error: { error: { message: String } }) => { Logger.error(error); return { error: { message: error } } });
        return stage as IEchoDefault<Object>;
    }

    async SynthesizeFilters() {
        if (this._filterGenericLoop) return;
        try {
            const req = await this.paymentSchema
                .findOne({
                    wasUsed: { $ne: true },
                    access: { $ne: null, $exists: true }
                }, { lastTransactionTime: true, access: true })
                .sort({ lastTransactionTime: 1 })
                .exec()
                .catch(Logger.error)

            if (req) {
                this._filterGenericLoop = true;
                const assembledTimeRange = new LocaleDate([
                    req.lastTransactionTime.getUTCFullYear(),
                    req.lastTransactionTime.getUTCMonth(),
                    req.lastTransactionTime.getUTCDate(),
                    req.lastTransactionTime.getUTCFullYear(),
                    req.lastTransactionTime.getUTCMonth(),
                    req.lastTransactionTime.getUTCDate(),
                ]);

                await this.paymentSchema
                    .aggregate([])
                    .match({
                        lastTransactionTime: {
                            $gte: assembledTimeRange.toDate("primary"),
                            $lte: assembledTimeRange.toDate("second")
                        },
                        access: { $eq: req.access }
                    })
                    .addFields({
                        averageEarnings: {
                            $divide: ["$earnings", {
                                $size: "$transactions"
                            }]
                        }
                    })
                    .group({
                        _id: null,
                        indexes: { $push: "$_id" },
                        minEarnings: { $min: "$earnings" },
                        maxEarnings: { $max: "$earnings" },
                        minTicketQuantity: { $min: "$tickets" },
                        maxTicketQuantity: { $max: "$tickets" },
                        minTransactionsQuantity: { $min: { $size: "$transactions" } },
                        maxTransactionsQuantity: { $max: { $size: "$transactions" } },
                        minAverageEarnings: { $min: "$averageEarnings" },
                        maxAverageEarnings: { $max: "$averageEarnings" },
                    })
                    .exec()
                    .then(async (_FilterNumbers: IStaticFilterNumber[]) => {
                        const { minEarnings,
                            maxEarnings,
                            minAverageEarnings,
                            maxAverageEarnings,
                            minTicketQuantity,
                            maxTicketQuantity,
                            minTransactionsQuantity,
                            maxTransactionsQuantity } = _FilterNumbers[0];

                        await this.paymentSchema
                            .aggregate([])
                            .match({
                                lastTransactionTime: {
                                    $gte: assembledTimeRange.toDate("primary"),
                                    $lte: assembledTimeRange.toDate("second")
                                },

                                access: { $eq: req.access }
                            })
                            .group({ _id: "$event", quantity: { $sum: 1 } })
                            .project({ _id: false, label: "$_id", quantity: true })
                            .exec()
                            .then(async (events: { label: String, quantity: Number }[]) => {
                                await this.paymentSchema
                                    .aggregate([])
                                    .match({
                                        lastTransactionTime: {
                                            $gte: assembledTimeRange.toDate("primary"),
                                            $lte: assembledTimeRange.toDate("second")
                                        },

                                        access: { $eq: req.access }
                                    })
                                    .group({ _id: "$city", quantity: { $sum: 1 } })
                                    .project({ _id: false, label: "$_id", quantity: true })
                                    .exec()
                                    .then(async (cities: { label: String, quantity: Number }[]) => {
                                        const _AssembledFilter = {
                                            cities,
                                            events,
                                            minTicketQuantity,
                                            maxTicketQuantity,
                                            minAverageEarnings,
                                            maxAverageEarnings,
                                            minEarnings,
                                            maxEarnings,
                                            minTransactionsQuantity,
                                            maxTransactionsQuantity,
                                            access: req.access
                                        };

                                        await this.paymentFiltersSchema
                                            .updateOne({ date: assembledTimeRange.toDate("primary"), access: req.access }, _AssembledFilter, { upsert: true })
                                            .exec()
                                            .then(async () => {
                                                await this.paymentSchema.updateMany({
                                                    lastTransactionTime: {
                                                        $gte: assembledTimeRange.toDate("primary"),
                                                        $lte: assembledTimeRange.toDate("second")
                                                    },

                                                    access: { $eq: req.access }
                                                }, { wasUsed: true }).exec()
                                            })
                                    })
                            });
                    });
            }
        } catch (e) {
            Logger.error(e);
        }
        finally { this._filterGenericLoop = false; }
    }

    async Synthesize(phone: String, access: String) {
        const dailyUser = await this.actionSchema.aggregate()
            .match({ "buyer.phone": { $eq: phone }, status: "WIDGET_PAYMENT", access: { $eq: access } })
            .group({
                _id: "$buyer.phone",
                tickets: { $push: "$tickets" },
                contracts: { $push: "$_id" },

                //name history
                names: {
                    $push: {
                        email: "$buyer.name",
                        date: "$date",
                        gender: '$buyer.gender',
                        id: "$_id"
                    }
                },

                // about
                email: { $last: '$buyer.email' },
                phone: { $last: '$buyer.phone' },
                gender: { $last: '$buyer.gender' },
                firstTransactionTime: { $first: '$date' },
                lastTransactionTime: { $last: '$date' },
                event: { $last: "$event.name" },
                city: { $last: '$addressInfo.city' },

                //cookies
                ya: { $push: '$analytics.yandex' },
                ga: { $push: '$analytics.google' },
                fb: { $push: '$analytics.facebook' },
                vs: { $push: '$analytics.vis' },
                sources: { $push: "$source" },

                transactions: {
                    $push: {
                        id: '$_id',
                        event: '$event.name',
                        earnings: {
                            $reduce: {
                                input: '$tickets',
                                initialValue: 0,
                                in: {
                                    $add: ['$$value', {
                                        $cond: {
                                            if: { $eq: ['$this.quantity', 1] },
                                            then: '$$this.price',
                                            else: {
                                                $multiply: ['$$this.price', '$$this.quantity'],
                                            },
                                        },
                                    }],
                                },
                            }
                        },

                        ticketsInTransaction: { $sum: '$tickets.quantity' },
                        transactionDate: '$date',
                        source: '$source',
                        city: '$addressInfo.city',
                        zip: '$addrssInfo.zip'
                    }
                }
            })
            .addFields({
                //concat arrays
                tickets: {
                    $reduce: {
                        input: '$tickets',
                        initialValue: [],
                        in: { $concatArrays: ['$$value', '$$this'] },
                    }
                }
            })
            .addFields({
                earnings: {
                    $reduce: {
                        input: '$tickets',
                        initialValue: 0,
                        in: {
                            $add: ['$$value', {
                                $cond: {
                                    if: { $eq: ['$this.quantity', 1] },
                                    then: '$$this.price',
                                    else: {
                                        $multiply: ['$$this.price', '$$this.quantity'],
                                    },
                                },
                            }],
                        },
                    },
                },
                tickets: { $sum: "$tickets.quantity" }
            })
            .project({
                _id: false,
                tickets: true,
                contracts: true,
                names: true,
                email: true,
                phone: true,
                gender: true,
                firstTransactionTime: true,
                lastTransactionTime: true,
                earnings: true,
                city: true,
                ya: true,
                ga: true,
                fb: true,
                vs: true,
                transactions: true,
                event: true,
                sources: true,
                access: true
            })
            .exec()
            .then((x: { shift: () => void; }) => x.shift());

        if (dailyUser)
            await this.paymentSchema.updateOne({ phone: dailyUser.phone, access }, {
                ...dailyUser,
                wasUsed: false
            }, { upsert: true })
                .exec()
                .then(async () => {
                    Logger.log(`Buyer ${phone} has been updated`);

                    await this.SynthesizeFilters().then(() =>
                        Logger.log(`Filter Synthesize success updated`))
                });
    }

    private async UpdateInner() {
        /*
        await this.actionSchema.updateMany({processed: true}, {processed: false}).exec();
        return;
        /**
         *  const sources = ["https://topconcerts.ru", "http://www.mxat-teatr.ru", "http://topconcerts.ru", "http://mxat-teatr.ru"];
         /*await this.actionSchema.updateMany({
      
            source: { $in: ["http://www.mxat-teatr.ru", "http://mxat-teatr.ru"] }
        },
            { processed: false, access: "5df6add233778f0919e448b8" }).exec()
      
         await this.actionSchema.deleteMany({
             source: { $nin: sources }
         }).exec()
 
         */
        this.actionSchema.find({
            status: 'WIDGET_PAYMENT',
            processed: { $ne: true },
            "buyer.phone": { $exists: true, $ne: null },
            access: { $ne: null, $exists: true }
        }, { "buyer.phone": true, access: true }, async (err, transactions) => {
            if (err) throw console.error(err);
            if (transactions.length) Logger.log(`New sales detected, processing in progress ${transactions.length}`, 'Payments');

            for (let index in transactions) {
                const transaction = transactions[index];
                await this.Synthesize(transaction.buyer.phone, transaction.access)
                    .then(async () => {
                        await this.actionSchema.updateOne({ _id: new ObjectID(transaction._id) }, { processed: true })
                            .exec();
                    });
            }

            setTimeout(this.UpdateInner.bind(this), transactions.length
                ? 1 : 1000);
        }).sort({ date: 1 });

        this.SynthesizeFilters().catch(console.error);
    }
}
