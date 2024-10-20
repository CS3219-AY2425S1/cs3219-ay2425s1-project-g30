import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from './env/env.service';
import { QuestionsModule } from './questions.module';

async function bootstrap() {
  const app = await NestFactory.create(QuestionsModule);
  const envService = app.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const QUESTION_SERVICE_HOST = envService.get('QUESTION_SERVICE_HOST');

  const host = NODE_ENV === 'development' ? 'localhost' : QUESTION_SERVICE_HOST;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: 3001,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3001);
  console.log(`Question Service is listening on ${host}:3001`);
}
bootstrap();
