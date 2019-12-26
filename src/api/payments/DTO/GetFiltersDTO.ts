import { IsNumber, ArrayMinSize, ArrayMaxSize, IsDefined, IsArray, Validate, ValidateNested, IsNumberString, IsNotEmpty, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';


export class GetFiltersDTO {
    @IsDefined()
    @Transform((query: String[]) => query.map(Number))
    @IsNotEmpty({ each: true })
    @IsInt({ each: true })
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    primaryDisassemdbledDate: number[]


    @IsDefined()
    @Transform((query: String[]) => query.map(Number))
    @IsNotEmpty({ each: true })
    @IsInt({ each: true })
    @ArrayMinSize(3)
    @ArrayMaxSize(3)
    secondDisassemdbledDate: number[]
}