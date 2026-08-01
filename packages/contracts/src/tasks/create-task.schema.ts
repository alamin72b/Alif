import { z } from 'zod';

export const createTaskSchema = z
  .object({
    command: z
      .string()
      .trim()
      .min(1, 'Command is required.')
      .max(4_000, 'Command cannot exceed 4,000 characters.'),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;