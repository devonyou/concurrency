import { Controller, Post, Body } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Post('/overbook')
    overbook(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationService.overbook(createReservationDto);
    }

    @Post('/pessimistic')
    pessimistic(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationService.pessimistic(createReservationDto);
    }

    @Post('/optimistic')
    optimistic(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationService.optimistic(createReservationDto);
    }

    @Post('/queue')
    async queue(@Body() createReservationDto: CreateReservationDto) {
        return await this.reservationService.queue(createReservationDto);
    }

    @Post('/queue/drain')
    drain() {
        return this.reservationService.drain();
    }
}
