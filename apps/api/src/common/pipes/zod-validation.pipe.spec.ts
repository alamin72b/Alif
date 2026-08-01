import { BadRequestException } from '@nestjs/common';
import { createTaskSchema } from '@alif/contracts';

import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(createTaskSchema);

  it('returns validated and normalized input', () => {
    expect(
      pipe.transform({
        command: '  Search for Project Alif  ',
      }),
    ).toEqual({
      command: 'Search for Project Alif',
    });
  });

  it('rejects an empty command', () => {
    expect(() =>
      pipe.transform({
        command: '   ',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects unexpected fields', () => {
    expect(() =>
      pipe.transform({
        command: 'Search for Project Alif',
        unsafeField: true,
      }),
    ).toThrow(BadRequestException);
  });
});
