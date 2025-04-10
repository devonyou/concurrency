import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationEntity } from './entities/reservation.entity';
import { DataSource, MoreThan } from 'typeorm';
import { ShowEntity } from 'src/show/entities/show.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReservationService {
    private readonly logger = new Logger(ReservationService.name);

    constructor(
        private readonly dataSource: DataSource,
        @InjectQueue('reservation-queue')
        private readonly reservationQueue: Queue,
    ) {}

    async overbook(createReservationDto: CreateReservationDto) {
        const { year, month, date, userId } = createReservationDto;

        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();

        try {
            const show = await qr.manager.findOne(ShowEntity, {
                where: { showDate: new Date(year, month - 1, date) },
            });

            if (show.seatCount > 0) {
                await qr.manager.update(ShowEntity, show.id, {
                    seatCount: show.seatCount - 1,
                });

                await qr.manager.save(ReservationEntity, {
                    showId: show.id,
                    userId: userId,
                });

                await qr.commitTransaction();
                await qr.release();

                return 'Reservation successful';
            } else {
                throw new Error('Reservation failed');
            }
        } catch (error) {
            await qr.rollbackTransaction();
            await qr.release();

            throw new HttpException('Reservation failed', 500);
        }
    }

    async pessimistic(createReservationDto: CreateReservationDto) {
        const { year, month, date, userId } = createReservationDto;

        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();

        try {
            const show = await qr.manager
                .createQueryBuilder(ShowEntity, 'show')
                .where({ showDate: new Date(year, month - 1, date) })
                .andWhere({ seatCount: MoreThan(0) })
                .setLock('pessimistic_write')
                .getOne();

            if (show) {
                await qr.manager.update(ShowEntity, show.id, {
                    seatCount: show.seatCount - 1,
                });

                await qr.manager.save(ReservationEntity, {
                    userId: userId,
                    show: show,
                });

                await qr.commitTransaction();
                await qr.release();
                return 'Reservation successful';
            } else {
                throw new HttpException('Show not found', 409);
            }
        } catch (error) {
            await qr.rollbackTransaction();
            await qr.release();

            if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
                // MySQL Timeout lock
                throw new HttpException('Database lock timeout', 503);
            } else if (error.code === 'ER_LOCK_DEADLOCK') {
                // Deadlock
                throw new HttpException('Deadlock detected', 500);
            } else {
                throw error;
            }
        }
    }

    async optimistic(createReservationDto: CreateReservationDto) {
        const { year, month, date, userId } = createReservationDto;

        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();

        try {
            const show = await qr.manager
                .createQueryBuilder(ShowEntity, 'show')
                .where({ showDate: new Date(year, month - 1, date) })
                .andWhere({ seatCount: MoreThan(0) })
                .getOne();

            if (show) {
                const updatedShow = await qr.manager
                    .getRepository(ShowEntity)
                    .createQueryBuilder()
                    .update()
                    .set({
                        seatCount: show.seatCount - 1,
                        version: show.version + 1,
                    })
                    .where({ id: show.id })
                    .andWhere({ version: show.version })
                    .execute();

                if (!updatedShow.affected) {
                    throw new HttpException('Optimistic failed', 409);
                }

                await qr.manager.save(ReservationEntity, {
                    userId: userId,
                    show: show,
                });

                await qr.commitTransaction();
                await qr.release();
                return 'Reservation successful';
            } else {
                throw new HttpException('Show not found', 409);
            }
        } catch (error) {
            await qr.rollbackTransaction();
            await qr.release();

            if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
                // MySQL Timeout lock
                throw new HttpException('Database lock timeout', 503);
            } else if (error.code === 'ER_LOCK_DEADLOCK') {
                // Deadlock
                throw new HttpException('Deadlock detected', 500);
            } else {
                throw error;
            }
        }
    }

    async queue(createReservationDto: CreateReservationDto) {
        await this.reservationQueue.add('reservation', createReservationDto);
    }

    async drain() {
        console.log('drain');
        await this.reservationQueue.drain();
    }
}
