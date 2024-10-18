import { NestFactory } from '@nestjs/core';
import { QuestionsModule } from './questions.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { EnvService } from './domain/env/env.service';
@Module({
  providers: [EnvService],
  exports: [EnvService],
})
class BootstrapConfigModule {}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    BootstrapConfigModule,
  );
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
