import * as mongoose from 'mongoose'

const AssembledFilterSchema = new mongoose.Schema({

    minEarnings: Number,
    maxEarnings: Number,
    minAverageEarnings: Number,
    maxAverageEarnings: Number,
    minTicketQuantity: Number,
    maxTicketQuantity: Number,
    minTransactionsQuantity: Number,
    maxTransactionsQuantity: Number,

    events: Array<{
        quantity: Number,
        label: String
    }>(),

    cities: Array<{
        quantity: Number,
        label: String
    }>(),

    date: Date,
    access: String
});

export { AssembledFilterSchema };