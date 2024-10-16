import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
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
  const AUTH_SERVICE_HOST = configService.get<string>('AUTH_SERVICE_HOST');
  appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: NODE_ENV === 'development' ? 'localhost' : AUTH_SERVICE_HOST,
        port: 3003,
      },
    },
  );
  await app.listen();
  console.log(`Auth Service is listening on ${AUTH_SERVICE_HOST}:3003`);
}
bootstrap();
