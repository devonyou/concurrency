import { Controller } from '@nestjs/common';
import {
    Ctx,
    MessagePattern,
    Payload,
    RmqContext,
} from '@nestjs/microservices';
import { ReservationRabbitmqWorker } from './reservation.rabbitmq.worker';

@Controller()
export class WorkerController {
    constructor(
        private readonly reservationRabbitmqWorker: ReservationRabbitmqWorker,
    ) {}

    @MessagePattern('reservation')
    async handleReservation(@Payload() data: any, @Ctx() context: RmqContext) {
        return await this.reservationRabbitmqWorker.process(data, context);
    }
}
