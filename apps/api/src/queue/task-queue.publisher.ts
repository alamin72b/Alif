import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  EXECUTE_TASK_JOB_NAME,
  executeTaskJobDataSchema,
  type ExecuteTaskJobData,
  type ExecuteTaskJobResult,
  TASK_QUEUE_NAME,
} from '@alif/contracts';
import type { Queue } from 'bullmq';

type ExecuteTaskQueue = Queue<
  ExecuteTaskJobData,
  ExecuteTaskJobResult,
  typeof EXECUTE_TASK_JOB_NAME
>;

const JOB_ATTEMPTS = 3;
const JOB_BACKOFF_DELAY_MS = 1_000;

@Injectable()
export class TaskQueuePublisher {
  constructor(
    @InjectQueue(TASK_QUEUE_NAME)
    private readonly taskQueue: ExecuteTaskQueue,
  ) {}

  async enqueue(taskId: string): Promise<string> {
    const jobData = executeTaskJobDataSchema.parse({
      taskId,
    });

    const job = await this.taskQueue.add(
      EXECUTE_TASK_JOB_NAME,
      jobData,
      {
        jobId: taskId,
        attempts: JOB_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: JOB_BACKOFF_DELAY_MS,
        },
        removeOnComplete: {
          age: 24 * 60 * 60,
          count: 1_000,
        },
        removeOnFail: {
          age: 7 * 24 * 60 * 60,
          count: 5_000,
        },
      },
    );

    if (!job.id) {
      throw new Error('BullMQ created a job without an ID.');
    }

    return job.id;
  }
}
