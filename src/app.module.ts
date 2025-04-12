import { Module } from '@nestjs/common';
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
import { RedisModule } from '@liaoliaots/nestjs-redis';
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

        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: +configService.get<number>('REDIS_PORT'),
                },
            }),
            inject: [ConfigService],
        }),

        BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
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
                            queue: 'reservation_queue',
                            queueOptions: {
                                durable: true,
                            },
                            prefetchCount: 1, // SUB에서 1개씩만 처리
                        },
                    }),
                },
            ],
        }),

        ShowModule,
        ReservationModule,
        WorkerModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
