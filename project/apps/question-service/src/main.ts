import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from './env/env.service';
import { QuestionsModule } from './questions.module';

async function bootstrap() {
  const appContext =
    await NestFactory.createApplicationContext(QuestionsModule);
  const envService = appContext.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const QUESTION_SERVICE_HOST = envService.get('QUESTION_SERVICE_HOST');
  appContext.close();

  const host = NODE_ENV === 'development' ? 'localhost' : QUESTION_SERVICE_HOST;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    QuestionsModule,
    {
      transport: Transport.TCP,
      options: {
        host: host,
        port: 3001,
      },
    },
  );
  await app.listen();
  console.log(`Question Service is listening on ${host}:3001`);
}
bootstrap();
