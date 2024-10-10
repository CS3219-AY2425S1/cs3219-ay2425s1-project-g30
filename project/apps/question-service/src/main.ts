import { NestFactory } from '@nestjs/core';
import { QuestionsModule } from './questions.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const host =
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : process.env.QUESTION_SERVICE_HOST || 'localhost';

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
