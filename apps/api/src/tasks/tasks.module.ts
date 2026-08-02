import { Module } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { PrismaTasksRepository } from './prisma-tasks.repository';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Module({
  providers: [
    PrismaService,
    TasksService,
    PrismaTasksRepository,
    {
      provide: TasksRepository,
      useExisting: PrismaTasksRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
