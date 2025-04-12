import { DataSource } from 'typeorm';
import { ShowEntity } from 'src/show/entities/show.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationEntity } from '../entities/reservation.entity';

@Injectable()
export class ReservationOverbookService {
    constructor(private readonly dataSource: DataSource) {}

    async execute(createReservationDto: CreateReservationDto) {
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
}
