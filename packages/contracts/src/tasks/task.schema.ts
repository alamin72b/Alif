import { z } from 'zod';

import { taskStatusSchema } from './task-status.schema';

export const taskSchema = z
  .object({
    id: z.string().uuid(),
    command: z.string().min(1).max(4_000),
    status: taskStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type Task = z.infer<typeof taskSchema>;