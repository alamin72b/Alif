import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { type ZodTypeAny, z } from 'zod';

@Injectable()
export class ZodValidationPipe<
  TSchema extends ZodTypeAny,
> implements PipeTransform<unknown, z.infer<TSchema>> {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.infer<TSchema> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        issues: result.error.issues.map((issue) => ({
          code: issue.code,
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    return result.data;
  }
}
