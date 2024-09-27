import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";
import { RpcException } from "@nestjs/microservices";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new RpcException(
          new BadRequestException(`Validation failed: ${error.errors}`),
        );
      }
      throw new RpcException(new BadRequestException(`Validation failed`));
    }
  }
}
