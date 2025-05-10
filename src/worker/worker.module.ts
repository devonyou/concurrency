import { Module } from '@nestjs/common';
import { ReservationRabbitmqWorker } from './reservation.rabbitmq.worker';
import { WorkerController } from './worker.controller';
// import { ReservationBullWorker } from './resrvation.bull.worker';
// import { ExpressAdapter } from '@bull-board/express';
// import { BullBoardModule } from '@bull-board/nestjs';
// import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationEntity } from 'src/reservation/entities/reservation.entity';
import { ShowEntity } from 'src/show/entities/show.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

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

        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                config: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: +configService.get<number>('REDIS_PORT'),
                },
            }),
            inject: [ConfigService],
        }),

        ClientsModule.registerAsync({
            isGlobal: true,
            clients: [
                {
                    inject: [ConfigService],
                    name: 'RESERVATION_SERVICE',
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.RMQ,
                        options: {
                            urls: [configService.get<string>('RABBITMQ_URL')],
                            queue: 'reservation-queue',
                            queueOptions: {
                                durable: true,
                            },
                            prefetchCount: 1,
                        },
                    }),
                },
            ],
        }),

        // BullModule.forRootAsync({
        //     useFactory: (configService: ConfigService) => ({
        //         connection: {
        //             host: configService.get<string>('REDIS_HOST'),
        //             port: +configService.get<number>('REDIS_PORT'),
        //         },
        //     }),
        //     inject: [ConfigService],
        // }),

        // BullBoardModule.forRoot({
        //     route: '/queues',
        //     adapter: ExpressAdapter,
        // }),
    ],
    controllers: [WorkerController],
    providers: [
        // ReservationBullWorker,
        ReservationRabbitmqWorker,
    ],
})
export class WorkerModule {}
