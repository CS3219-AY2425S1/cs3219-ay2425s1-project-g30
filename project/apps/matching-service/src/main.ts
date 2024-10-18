import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from './env/env.service';
import { MatchingModule } from './matching.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(MatchingModule);
  const envService = appContext.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const MATCHING_SERVICE_HOST = envService.get('MATCHING_SERVICE_HOST');
  appContext.close();

  const host = NODE_ENV === 'development' ? 'localhost' : MATCHING_SERVICE_HOST;
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
