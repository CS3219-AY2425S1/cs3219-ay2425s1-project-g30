import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from './domain/env/env.service';
import { UsersModule } from './users.module';
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
  const USER_SERVICE_HOST = envService.get('USER_SERVICE_HOST');
  appContext.close();

  const host = NODE_ENV === 'development' ? 'localhost' : USER_SERVICE_HOST;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: {
        host: host,
        port: 3002,
      },
    },
  );
  await app.listen();
  console.log(`User Service is listening on ${host}:3002`);
}
bootstrap();
