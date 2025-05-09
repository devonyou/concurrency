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
        const stream = this.rmqClient.send('reservation', {
            year,
            month,
            date,
            userId: userIdWithTime,
        });
        stream.subscribe({
            complete: () => {
                console.log('complete');
            },
            error: err => {
                console.log(err);
            },
            next: result => {
                console.log(result);
            },
        });
        return stream;
    }
}
