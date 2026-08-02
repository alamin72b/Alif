import { z } from 'zod';

export const QUEUE_KEY_PREFIX = 'alif';

export const TASK_QUEUE_NAME = 'agent-tasks';

export const EXECUTE_TASK_JOB_NAME = 'execute-task';

export type ExecuteTaskJobName =
  typeof EXECUTE_TASK_JOB_NAME;

export const executeTaskJobDataSchema = z
  .object({
    taskId: z.string().uuid(),
  })
  .strict();

export type ExecuteTaskJobData = z.infer<
  typeof executeTaskJobDataSchema
>;

export const executeTaskJobResultSchema = z
  .object({
    taskId: z.string().uuid(),
    status: z.literal('RUNNING'),
    acceptedAt: z.string().datetime(),
  })
  .strict();

export type ExecuteTaskJobResult = z.infer<
  typeof executeTaskJobResultSchema
>;
