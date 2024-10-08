import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: {
        host:
          process.env.NODE_ENV === 'development'
            ? 'localhost'
            : process.env.USER_SERVICE_HOST || 'localhost',
        port: 3002,
      },
    },
  );
  await app.listen();
  console.log('User Service is listening...');
}
bootstrap();
