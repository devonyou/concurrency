import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from './entities/reservation.entity';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ReservationOverbookService } from './service/reservation.overbook.service';
import { ReservationPessimisticService } from './service/reservation.pessimistic.service';
import { ReservationOptimisticService } from './service/reservation.optimistic.service';
import { ReservationRedisService } from './service/reservation.redis.service';
import { ReservationBullmqService } from './service/reservation.bullmq.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ReservationRabbitmqService } from './service/reservation.rabbitmq.service';

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

        RedisModule,
    ],
    controllers: [ReservationController],
    providers: [
        ReservationOverbookService,
        ReservationPessimisticService,
        ReservationOptimisticService,
        ReservationBullmqService,
        ReservationRedisService,
        ReservationRabbitmqService,
    ],
})
export class ReservationModule {}
