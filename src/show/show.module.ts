import { Module } from '@nestjs/common';
import { ShowService } from './show.service';
import { ShowController } from './show.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowEntity } from './entities/show.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ShowEntity])],
    controllers: [ShowController],
    providers: [ShowService],
})
export class ShowModule {}
