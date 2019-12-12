import { Document } from "mongoose";
import { ObjectID } from "bson";
import { IAnalytics } from "./Types/IAnalytics";
import { IAddressInfo } from "./Types/IAddressInfo";
import { ITicket } from "./Types/ITicket";

export interface IActionSchema extends Document {
    _id: ObjectID;
    session: String;
    address: String;
    addressInfo: IAddressInfo;
    analytics: IAnalytics;
    trash: ITicket[];
    tickets: ITicket[];
    browser: {
        name: String;
        version: String;
    };
    os: {
        name: String;
        arch: String;
    };
    product: String;
    utm: {
        source: String;
        tags: Object[]
    };
    url: String;
    status: String;
    date: Date;
    event: {
        name: String;
        date: Date;
        id: Number;
    };
    buyer: {
        name: String;
        email: String;
        phone: String;
        gender: Number;
    };
    orderId: Number;
    payment: String;
    isSheet: Boolean;
}