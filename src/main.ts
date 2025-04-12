import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get<ConfigService>(ConfigService);

    const config = new DocumentBuilder()
        .setTitle(configService.get<string>('SWAGGER_TITLE'))
        .setDescription(configService.get<string>('SWAGGER_DESCRIPTION'))
        .setVersion(configService.get<string>('SWAGGER_VERSION'))
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
        configService.get<string>('SWAGGER_PATH'),
        app,
        document,
    );

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'reservation_queue',
            queueOptions: {
                durable: true,
            },
            prefetchCount: 1,
            noAck: false,
        },
    });

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: false,
        }),
    );

    await app.startAllMicroservices();
    await app.listen(configService.get<number>('HTTP_PORT'));
}
bootstrap();
