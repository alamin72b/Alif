import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TASK_QUEUE_NAME } from '@alif/contracts';

import { TaskQueuePublisher } from './task-queue.publisher';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TASK_QUEUE_NAME,
    }),
  ],
  providers: [TaskQueuePublisher],
  exports: [TaskQueuePublisher],
})
export class TaskQueueModule {}
