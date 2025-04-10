import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShowModule } from './show/show.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowEntity } from './show/entities/show.entity';
import { ReservationModule } from './reservation/reservation.module';
import { ReservationEntity } from './reservation/entities/reservation.entity';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { WorkerModule } from './worker/worker.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                url: configService.get<string>('MYSQL_URL'),
                autoLoadEntities: true,
                synchronize: true,
                // logging: true,
                entities: [ShowEntity, ReservationEntity],
            }),
        }),
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                    username: configService.get<string>('REDIS_USERNAME'),
                    password: configService.get<string>('REDIS_PASSWORD'),
                },
            }),
            inject: [ConfigService],
        }),

        BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
        }),

        ShowModule,
        ReservationModule,
        WorkerModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
