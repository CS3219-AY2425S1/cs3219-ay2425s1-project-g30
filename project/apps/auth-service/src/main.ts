import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { EnvService } from './env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const envService = app.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const AUTH_SERVICE_HOST = envService.get('AUTH_SERVICE_HOST');

  const host = NODE_ENV === 'development' ? 'localhost' : AUTH_SERVICE_HOST;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: host,
      port: 3003,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3003);
  console.log(`Auth Service is listening on ${host}:3003`);
}
bootstrap();
