import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { DataSource } from 'typeorm';
import { ShowEntity } from 'src/show/entities/show.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { ReservationEntity } from '../entities/reservation.entity';

@Injectable()
export class ReservationRedisService {
    private redis: Redis;

    constructor(
        private readonly dataSource: DataSource,
        private readonly redisService: RedisService,
    ) {
        this.redis = redisService.getOrThrow();
    }

    async execute(createReservationDto: CreateReservationDto) {
        const { year, month, date, userId } = createReservationDto;

        const lockKey = `lock:show:${year}-${month}-${date}`;
        const lockValue = `${userId}-${Date.now()}`;

        const acquired = await this.acquireLock(lockKey, lockValue, 5);
        if (!acquired) throw new HttpException('Reservation failed', 409);

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const show = await qr.manager.findOne(ShowEntity, {
                where: { showDate: new Date(year, month - 1, date) },
            });

            if (show?.seatCount > 0) {
                await qr.manager.update(ShowEntity, show.id, {
                    seatCount: show.seatCount - 1,
                });

                await qr.manager.save(ReservationEntity, {
                    userId: userId,
                    show: show,
                });

                await qr.commitTransaction();
                await qr.release();
                await this.releaseLock(lockKey, lockValue);
            }
        } catch (err) {
            await qr.rollbackTransaction();
            await qr.release();
            await this.releaseLock(lockKey, lockValue);
            throw new HttpException(err, 500);
        }
    }

    async acquireLock(lockKey: string, lockValue: string, ttl: number) {
        const acquired = await this.redis.set(
            lockKey,
            lockValue,
            'EX',
            ttl,
            'NX',
        );
        return acquired === 'OK';
    }

    async releaseLock(lockKey: string, lockValue: string) {
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `;
        const result = await this.redis.eval(script, 1, [lockKey, lockValue]);
        return result === 1;
    }
}
