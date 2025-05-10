import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { ReservationEntity } from 'src/reservation/entities/reservation.entity';
import { ShowEntity } from 'src/show/entities/show.entity';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@Injectable()
export class ReservationRabbitmqWorker {
    private redis: Redis;

    constructor(
        private readonly dataSource: DataSource,
        private readonly redisService: RedisService,
    ) {
        this.redis = redisService.getOrThrow();
    }

    async process(data: any, context: RmqContext) {
        const { year, month, date, userId } = data;

        const lockKey = `lock:show:${year}-${month}-${date}`;
        const lockValue = userId;

        const acquired = await this.acquireLock(lockKey, lockValue, 5);
        if (!acquired) {
            const channel = context.getChannelRef();
            const originalMsg = context.getMessage();
            channel.ack(originalMsg);
            return { success: false, userId };
        }

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

                return { success: true, userId };
            } else {
                return { success: false, userId };
            }
        } catch (err) {
            await qr.rollbackTransaction();
            return { success: false, userId };

            // 메시지 처리 실패 시 nack 전송 (재시도)
            //   const channel = context.getChannelRef();
            //   const originalMsg = context.getMessage();
            //   channel.nack(originalMsg, false, true);
        } finally {
            await qr.release();
            await this.releaseLock(lockKey, lockValue);

            // 메시지 ack 전송
            const channel = context.getChannelRef();
            const originalMsg = context.getMessage();
            channel.ack(originalMsg);
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
