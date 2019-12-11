import * as mongoose from 'mongoose'
import { IPaymentSchema } from './IPaymentSchema'
import { ObjectId, ObjectID } from 'bson'
import { IAddressInfo } from './Types/IAddressInfo';

const PaymentSchema = new mongoose.Schema<IPaymentSchema>({
    _id: ObjectID,
    phone: String,
    name: String,
    email: String,
    gender: Number,
    earnings: Number,
    tickets: Number,
    averageEarnings: Number,
    lastActivity: Date,
    firstActivity: Date,
    transactions: Number,
    accessSources: Array<String>(),
    locations: Array<IAddressInfo>()
})

export { PaymentSchema };