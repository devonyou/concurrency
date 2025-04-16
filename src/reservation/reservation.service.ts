import { Injectable, Logger } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class ReservationService {
    private readonly logger = new Logger(ReservationService.name);

    constructor(
        private readonly dataSource: DataSource,
        @InjectQueue('reservation-queue')
        private readonly reservationQueue: Queue,
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getOrThrow();
    }

    async execute(createReservationDto: CreateReservationDto) {
        const { year, month, date, userId } = createReservationDto;
        const lockKey = `lock:reservation:`;
    }
}
