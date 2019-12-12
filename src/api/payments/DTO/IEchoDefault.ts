import { IErrorTypes } from "../Schemas/Types/IErrorTypes";

export class IEchoDefault<T> {
    error?: {
        message: String,
        code: IErrorTypes
    };

    then: T;
    debug?: {
        perfomance: Number
    }
}