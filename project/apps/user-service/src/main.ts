import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EnvService } from './env/env.service';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const envService = app.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const USER_SERVICE_HOST = envService.get('USER_SERVICE_HOST');

  const host = NODE_ENV === 'development' ? 'localhost' : USER_SERVICE_HOST;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: 3002,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3002);
  console.log(`User Service is listening on ${host}:3002`);
}
bootstrap();
