import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { format } from 'date-fns';

@Injectable()
export class ReservationRabbitmqService {
    constructor(
        @Inject('RESERVATION_SERVICE') private rmqClient: ClientProxy,
    ) {}

    execute(createReservationDto: CreateReservationDto) {
        const { year, month, date, userId } = createReservationDto;
        const userIdWithTime = `${userId}-${format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS ')}`;
        return this.rmqClient.emit('reservation', {
            year,
            month,
            date,
            userId: userIdWithTime,
        });
    }
}
