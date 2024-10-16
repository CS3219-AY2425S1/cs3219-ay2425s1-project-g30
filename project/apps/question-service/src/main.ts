import { NestFactory } from '@nestjs/core';
import { QuestionsModule } from './questions.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class BootstrapConfigModule {}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    BootstrapConfigModule,
  );
  const configService = appContext.get(ConfigService);
  const NODE_ENV = configService.get<string>('NODE_ENV');
  const QUESTION_SERVICE_HOST = configService.get<string>(
    'QUESTION_SERVICE_HOST',
  );
  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    QuestionsModule,
    {
      transport: Transport.TCP,
      options: {
        host: NODE_ENV === 'development' ? 'localhost' : QUESTION_SERVICE_HOST,
        port: 3001,
      },
    },
  );
  await app.listen();
  console.log(`Question Service is listening on ${QUESTION_SERVICE_HOST}:3001`);
}
bootstrap();
