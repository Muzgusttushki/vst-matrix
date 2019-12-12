import * as mongoose from 'mongoose';
import { IActionSchema } from './IActionSchema';
import { ObjectID } from 'bson';
import { ITicket } from './Types/ITicket';

const ActionSchema = new mongoose.Schema<IActionSchema>({
    _id: ObjectID,
    session: String,
    address: String,
    addressInfo: {
        city: String,
        country: String,
        zip: String,
        timezone: String,
        region: String
    },
    analytics: {
        google: String,
        facebook: String,
        vis: String,
        yandex: String
    },
    trash: Array<ITicket>(),
    tickets: Array<ITicket>(),
    browser: {
        name: String,
        version: String,
    },
    os: {
        name: String,
        arch: String,
    },
    product: String,
    utm: {
        source: String,
        tags: Array<Object>()
    },
    url: String,
    status: String,
    date: Date,
    event: {
        name: String,
        date: Date,
        id: Number,
    },
    buyer: {
        name: String,
        email: String,
        phone: String,
        gender: Number,
    },
    orderId: Number,
    payment: String,
    isSheet: Boolean,
});

export { ActionSchema };