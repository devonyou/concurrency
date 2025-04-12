import { HttpException, Injectable } from '@nestjs/common';
import { ShowEntity } from 'src/show/entities/show.entity';
import { DataSource, MoreThan } from 'typeorm';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationEntity } from '../entities/reservation.entity';

@Injectable()
export class ReservationPessimisticService {
    constructor(private readonly dataSource: DataSource) {}

    async execute(createReservationDto: CreateReservationDto) {
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
}
