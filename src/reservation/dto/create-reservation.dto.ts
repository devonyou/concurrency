import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReservationDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsNumber()
    year: number;

    @IsNotEmpty()
    @IsNumber()
    month: number;

    @IsNotEmpty()
    @IsNumber()
    date: number;
}
