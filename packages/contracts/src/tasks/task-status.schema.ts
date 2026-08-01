import { z } from 'zod';

export const taskStatusSchema = z.enum([
  'PENDING',
  'QUEUED',
  'RUNNING',
  'WAITING_FOR_CONFIRMATION',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;