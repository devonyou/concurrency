import { Module } from '@nestjs/common';
import { ReservationBullWorker } from './resrvation.bull.worker';
import { ReservationRabbitmqWorker } from './reservation.rabbitmq.worker';
import { WorkerController } from './worker.controller';

@Module({
    controllers: [WorkerController],
    providers: [ReservationBullWorker, ReservationRabbitmqWorker],
})
export class WorkerModule {}
