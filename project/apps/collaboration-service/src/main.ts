import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// import { EnvService } from './env/env.service';
import { CollaborationModule } from './collaboration.module';

async function bootstrap() {
  /*
  const appContext =
    await NestFactory.createApplicationContext(CollaborationModule);
  const envService = appContext.get(EnvService);
  const NODE_ENV = envService.get('NODE_ENV');
  const COLLABORATION_SERVICE_HOST = envService.get(
    'COLLABORATION_SERVICE_HOST',
  );
  appContext.close();\

  const host =
    NODE_ENV === 'development' ? 'localhost' : COLLABORATION_SERVICE_HOST;
  */

  // NOTE: cannot use envService above, as it will create 2 instances of
  // hocuspocus server with the same port number

  const host =
    process.env.NODE_ENV === 'development'
      ? 'localhost'
      : process.env.COLLABORATION_SERVICE_HOST;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CollaborationModule,
    {
      transport: Transport.TCP,
      options: {
        host: host,
        port: 3005,
      },
    },
  );

  await app.listen();
  console.log(`Collaboration Service is listening on ${host}:3005`);
}
bootstrap();
