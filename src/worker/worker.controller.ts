import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ReservationRabbitmqWorker } from './reservation.rabbitmq.worker';

@Controller()
export class WorkerController {
    constructor(
        private readonly reservationRabbitmqWorker: ReservationRabbitmqWorker,
    ) {}

    @EventPattern('reservation')
    async handleReservation(@Payload() data: any, @Ctx() context: RmqContext) {
        await this.reservationRabbitmqWorker.process(data, context);
    }
}
