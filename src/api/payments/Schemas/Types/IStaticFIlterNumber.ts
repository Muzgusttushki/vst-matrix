import { ObjectID } from "bson";
export class IStaticFilterNumber {
    minEarnings: Number;
    maxEarnings: Number;
    minTicketQuantity: Number;
    maxTicketQuantity: Number;
    minTransactionsQuantity: Number;
    maxTransactionsQuantity: Number;
    minAverageEarnings: Number;
    maxAverageEarnings: Number;
    indexes: ObjectID[]
}