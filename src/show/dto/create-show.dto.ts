import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSampleShowDto {
    @IsNumber()
    @IsNotEmpty()
    year: number;

    @IsNumber()
    @IsNotEmpty()
    month: number;

    @IsNumber()
    @IsNotEmpty()
    seatCount: number;
}
