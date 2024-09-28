import { PipeTransform, ArgumentMetadata } from "@nestjs/common";
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
        // Format Zod errors into a readable structure
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        // Throw RpcException with the structured error
        throw new RpcException({
          statusCode: 400,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      // Fallback for unknown errors
      throw new RpcException({
        statusCode: 500,
        message: "Internal server error during validation",
      });
    }
  }
}
