import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from './env/env.service';
import { MatchingModule } from './matching.module';

async function bootstrap() {
  const app = await NestFactory.create(MatchingModule);
  const envService = app.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const MATCHING_SERVICE_HOST = envService.get('MATCHING_SERVICE_HOST');
  // appContext.close();

  const host = NODE_ENV === 'development' ? 'localhost' : MATCHING_SERVICE_HOST;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: 3004,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3004);
  console.log(`Matching Service is listening on ${host}:3004`);
}
bootstrap();
