import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  InternalServerErrorException,
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
        // Format Zod errors into a readable format
        const formattedErrors = error.errors
          .map((err) => {
            const path = err.path.join(".");
            const message = err.message;
            return `${path}: ${message}`;
          })
          .join(", ");

        // Throw HTTP exception wrapped in an RpcException
        throw new RpcException(
          new BadRequestException(`Validation failed: ${formattedErrors}`)
        );
      }
      // Fallback for unknown errors
      throw new RpcException(
        new InternalServerErrorException("Validation failed, unknown error")
      );
    }
  }
}
