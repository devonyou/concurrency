import { Module } from '@nestjs/common';
import { ReservationWorker } from './resrvation.worker';

@Module({
    providers: [ReservationWorker],
})
export class WorkerModule {}
