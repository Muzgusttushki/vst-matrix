import { Injectable, Logger } from '@nestjs/common';
import { IEchoDefault } from './DTO/IEchoDefault';
import { InjectModel } from '@nestjs/mongoose';
import { IPaymentSchema } from './Schemas/IPaymentSchema';
import { Model } from 'mongoose';
import { IActionSchema } from '../../services/actions/Schemas/IActionSchema';
import { ObjectID } from 'bson';

@Injectable()
export class PaymentsService {
    constructor(@InjectModel('t_payments') private readonly paymentSchema: Model<IPaymentSchema>,
        @InjectModel('buyers') private readonly actionSchema: Model<IActionSchema>) {
        this.SampleRun();
    }

    async Synthesize(phone: String): Promise<IEchoDefault<String>> {
        const dailyUser = await this.actionSchema.aggregate()
            .match({ "buyer.phone": { $eq: phone }, status: "WIDGET_PAYMENT" })
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
                city: { $last: '$addressInfo.city' },

                //cookies
                ya: { $push: '$analytics.yandex' },
                ga: { $push: '$analytics.google' },
                fb: { $push: '$analytics.facebook' },
                vs: { $push: '$analytics.vis' },

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
                city: true,
                ya: true,
                ga: true,
                fb: true,
                vs: true,
                transactions: true
            })
            .exec()
            .then((x: { shift: () => void; }) => x.shift());

        if (dailyUser)
            await this.paymentSchema.updateOne({ phone: dailyUser.phone }, dailyUser, { upsert: true })
                .exec()
                .then(() =>
                    Logger.log(`Buyer ${phone} has been updated`))

        return null;
    }


    SampleRun() {
        this.actionSchema.find({ status: 'WIDGET_PAYMENT', processed: { $ne: true } }, { "buyer.phone": true }, async (err, transactions) => {
            if (err) throw console.error(err);
            Logger.log(`New sales detected, processing in progress ${transactions.length}`, 'Payments');

            for (let index in transactions) {
                const transaction = transactions[index];
                await this.Synthesize(transaction.buyer.phone)
                    .then(async () => {
                        await this.actionSchema.updateOne({ _id: new ObjectID(transaction._id) }, { processed: true })
                            .exec();
                    });
            }

            setTimeout(this.SampleRun.bind(this), transactions.length
                ? 60000 : 1000);
        }).sort({ date: 1 });
    }
}
