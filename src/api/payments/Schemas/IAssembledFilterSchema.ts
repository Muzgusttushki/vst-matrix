import { ObjectID } from "bson";
import { Document } from "mongoose";

export interface IAssembledFilterSchema extends Document {
    minEarnings: Number;
    maxEarnings: Number;
    minAverageEarnings: Number;
    maxAverageEarnings: Number;
    minTicketQuantity: Number;
    maxTicketQuantity: Number;
    minTransactionsQuantity: Number;
    maxTransactionsQuantity: Number;

    events: {
        quantity: Number,
        label: String
    }[],

    cities: {
        quantity: Number,
        label: String
    }[],

    date: Date,
    access: String
}