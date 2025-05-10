import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReservationDto } from '../dto/create-reservation.dto';

@Injectable()
export class ReservationRabbitmqService {
    constructor(
        @Inject('RESERVATION_SERVICE') private rmqClient: ClientProxy,
    ) {}

    execute(createReservationDto: CreateReservationDto) {
        return this.rmqClient.send('reservation', createReservationDto);
    }
}
