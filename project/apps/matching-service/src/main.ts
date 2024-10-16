import { NestFactory } from '@nestjs/core';
import { MatchingModule } from './matching.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

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
  const MATCHING_SERVICE_HOST = configService.get<string>(
    'MATCHING_SERVICE_HOST',
  );
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
