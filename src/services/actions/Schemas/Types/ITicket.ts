export class ITicket {
    discount: {
        type: String;
        value: Number;
    };

    price: Number;
    tariff: String;
    quantity: Number;
    promocode: String;
    variant: String;
}