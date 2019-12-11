import { ObjectID } from "bson";
import { IAddressInfo } from "./Types/IAddressInfo";

export interface IPaymentSchema {
    _id: ObjectID
    phone: String
    name: String
    email: String
    gender: Number
    earnings: Number
    tickets: Number
    averageEarnings: Number
    lastActivity: Date
    firstActivity: Date
    transactions: Number
    accessSources: String[],
    locations: IAddressInfo[]
}