import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { RpcExceptionInterceptor } from './interceptors/rpc-exception.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalFilters(new RpcExceptionFilter());
  app.useGlobalInterceptors(new RpcExceptionInterceptor());
  await app.listen(4000);
}
bootstrap();
