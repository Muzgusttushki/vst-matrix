import { IsString, IsArray, ArrayMaxSize, IsNumber, MinLength, ArrayMinSize, IsDefined } from "class-validator"

export class UserListDTO {
    @IsArray()
    @IsString({ each: true })
    cities: String[]

    @IsArray()
    @IsString({ each: true })
    events: String[]

    @IsDefined()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    averageEarnings: Number[]

    @IsDefined()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    earnings: Number[]

    @IsDefined()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    ticketQuantity: Number[]

    @IsDefined()
    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    transactionQunatity: Number[]
}