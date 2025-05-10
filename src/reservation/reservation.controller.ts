import { Controller, Post, Body } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationOptimisticService } from './service/reservation.optimistic.service';
import { ReservationOverbookService } from './service/reservation.overbook.service';
import { ReservationPessimisticService } from './service/reservation.pessimistic.service';
import { ReservationRedisService } from './service/reservation.redis.service';
// import { ReservationBullmqService } from './service/reservation.bullmq.service';
import { ReservationRabbitmqService } from './service/reservation.rabbitmq.service';

@Controller('reservation')
export class ReservationController {
    constructor(
        private readonly reservationOverbookService: ReservationOverbookService,
        private readonly reservationPessimisticService: ReservationPessimisticService,
        private readonly reservationOptimisticService: ReservationOptimisticService,
        // private readonly reservationBullmqService: ReservationBullmqService,
        private readonly reservationRedisService: ReservationRedisService,
        private readonly reservationRabbitmqService: ReservationRabbitmqService,
    ) {}

    @Post('/overbook')
    overbook(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationOverbookService.execute(createReservationDto);
    }

    @Post('/pessimistic')
    pessimistic(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationPessimisticService.execute(createReservationDto);
    }

    @Post('/optimistic')
    optimistic(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationOptimisticService.execute(createReservationDto);
    }

    // @Post('/bullmq')
    // async bullmq(@Body() createReservationDto: CreateReservationDto) {
    //     return await this.reservationBullmqService.execute(
    //         createReservationDto,
    //     );
    // }

    @Post('/redis')
    async redis(@Body() createReservationDto: CreateReservationDto) {
        return await this.reservationRedisService.execute(createReservationDto);
    }

    @Post('/rabbitmq')
    rabbitmq(@Body() createReservationDto: CreateReservationDto) {
        const stream =
            this.reservationRabbitmqService.execute(createReservationDto);
        stream.subscribe(result => {
            if (result.success) console.log(result.userId);
        });
    }
}
