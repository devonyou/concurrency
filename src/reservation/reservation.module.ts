import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from './entities/reservation.entity';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReservationEntity]),

        BullModule.registerQueue({
            name: 'reservation-queue',
        }),

        BullBoardModule.forFeature({
            name: 'reservation-queue',
            adapter: BullMQAdapter,
        }),
    ],
    controllers: [ReservationController],
    providers: [ReservationService],
})
export class ReservationModule {}
