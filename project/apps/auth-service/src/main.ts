import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host:
          process.env.NODE_ENV === 'development'
            ? 'localhost'
            : process.env.AUTH_SERVICE_HOST || 'localhost',
        port: 3003,
      },
    },
  );
  await app.listen();
  console.log('Auth Service is listening...');
}
bootstrap();
