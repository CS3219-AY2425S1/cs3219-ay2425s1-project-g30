import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { RpcExceptionInterceptor } from './interceptors/rpc-exception.interceptor';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bufferLogs: true });
  app.use(cookieParser());
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalInterceptors(new RpcExceptionInterceptor());
  await app.listen(4000);
  console.log('Api Gateway is listening on port 4000');
}
bootstrap();
