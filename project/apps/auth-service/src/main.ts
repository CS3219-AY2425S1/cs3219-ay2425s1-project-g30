import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
// import { EnvService } from './env/env.service';

async function bootstrap() {
  // const appContext = await NestFactory.createApplicationContext(AuthModule);
  // const envService = appContext.get(EnvService);
  // const NODE_ENV = envService.get('NODE_ENV');
  // const AUTH_SERVICE_HOST = envService.get('AUTH_SERVICE_HOST');
  // appContext.close();

  // Reverting back to use process.env for testing AWS deployment

  const host =
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : process.env.AUTH_SERVICE_HOST;
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 3003,
      },
    },
  );
  await app.listen();
  console.log(`Auth Service is listening on ${host}:3003`);
}
bootstrap();
