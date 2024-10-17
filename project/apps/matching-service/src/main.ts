import { NestFactory } from '@nestjs/core';
import { MatchingModule } from './matching.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const host =
  process.env.NODE_ENV === 'development'
    ? 'localhost'
    : process.env.MATCHING_SERVICE_HOST || 'localhost';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MatchingModule,
    {
      transport: Transport.TCP,
      options: {
        host: host,
        port: 3004,
      },
    },
  );

  await app.listen();
  console.log(`Matching Service is listening on ${host}:3004`);
}
bootstrap();
