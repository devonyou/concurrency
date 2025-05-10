import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(WorkerModule);

    const configService = app.get<ConfigService>(ConfigService);

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'reservation-queue',
            queueOptions: {
                durable: true,
            },
            prefetchCount: 1,
            noAck: false,
        },
    });

    await app.startAllMicroservices();
}
bootstrap();
