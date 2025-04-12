import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';
import { ReservationEntity } from 'src/reservation/entities/reservation.entity';
import { ShowEntity } from 'src/show/entities/show.entity';
import { DataSource, MoreThan } from 'typeorm';

@Processor('reservation-queue')
export class ReservationBullWorker {
    constructor(private readonly dataSource: DataSource) {}

    @Process('reservation')
    async process(job: Job): Promise<any> {
        const { year, month, date, userId } = job.data;

        const qr = this.dataSource.createQueryRunner();

        await qr.connect();

        const show = await qr.manager
            .createQueryBuilder(ShowEntity, 'show')
            .where({ showDate: new Date(year, month - 1, date) })
            .andWhere({ seatCount: MoreThan(0) })
            .getOne();

        if (show) {
            await qr.manager
                .getRepository(ShowEntity)
                .createQueryBuilder()
                .update()
                .set({
                    seatCount: show.seatCount - 1,
                })
                .where({ id: show.id })
                .execute();

            await qr.manager.save(ReservationEntity, {
                userId: userId,
                show: show,
            });

            await qr.release();

            return 1;
        } else {
            await qr.release();
            return 0;
        }
    }
}
