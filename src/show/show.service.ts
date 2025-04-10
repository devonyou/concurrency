import { Injectable } from '@nestjs/common';
import { CreateSampleShowDto } from './dto/create-show.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShowEntity } from './entities/show.entity';
import { Repository } from 'typeorm';
import { eachDayOfInterval, lastDayOfMonth } from 'date-fns';

@Injectable()
export class ShowService {
    constructor(
        @InjectRepository(ShowEntity)
        private readonly showRepository: Repository<ShowEntity>,
    ) {}

    async sampleShow(createSampleShowDto: CreateSampleShowDto) {
        const { year, month, seatCount } = createSampleShowDto;
        const startDate = new Date(year, month - 1, 1);
        const endDate = lastDayOfMonth(new Date(year, month - 1, 1));

        const dates = eachDayOfInterval({ start: startDate, end: endDate });

        const shows = await this.showRepository
            .createQueryBuilder()
            .insert()
            .values(
                dates.map(date => ({
                    showDate: date,
                    seatCount: seatCount,
                })),
            )
            .execute();

        return shows;
    }
}
