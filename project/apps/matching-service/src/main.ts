import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { EnvService } from './env/env.service';
import { MatchingModule } from './matching.module';

async function bootstrap() {
  const app = await NestFactory.create(MatchingModule);

  app.enableShutdownHooks();

  app.enableCors({
    origin: true,
    credentials: true,
  });
  const host =
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : process.env.MATCHING_SERVICE_HOST;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: 3004,
    },
  });
  await app.startAllMicroservices();
  await app.listen(8080);
  console.log(`Matching Service is listening on ${host}:3004`);
}
bootstrap();
