import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { CollaborationModule } from './collaboration.module';
async function bootstrap() {
  // will use envService after integrating with the env module
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
