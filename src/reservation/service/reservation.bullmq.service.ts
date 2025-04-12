import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationBullmqService {
    constructor(
        @InjectQueue('reservation-queue')
        private readonly reservationQueue: Queue,
    ) {}

    async execute(createReservationDto: CreateReservationDto) {
        await this.reservationQueue.add('reservation', createReservationDto);
    }
}
