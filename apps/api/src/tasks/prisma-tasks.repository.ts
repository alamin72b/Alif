import { Injectable } from '@nestjs/common';
import {
  type CreateTaskInput,
  type Task,
  type TaskStatus,
} from '@alif/contracts';

import { PrismaService } from '../database/prisma.service';
import { mapDatabaseTask } from './task.mapper';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class PrismaTasksRepository
  implements TasksRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const task = await this.prisma.client.task.create({
      data: {
        command: input.command,
      },
    });

    return mapDatabaseTask(task);
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.prisma.client.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks.map(mapDatabaseTask);
  }

  async findOne(id: string): Promise<Task | null> {
    const task = await this.prisma.client.task.findUnique({
      where: {
        id,
      },
    });

    return task ? mapDatabaseTask(task) : null;
  }

  async transitionStatus(
    id: string,
    fromStatuses: readonly TaskStatus[],
    toStatus: TaskStatus,
  ): Promise<Task | null> {
    const result = await this.prisma.client.task.updateMany({
      where: {
        id,
        status: {
          in: [...fromStatuses],
        },
      },
      data: {
        status: toStatus,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findOne(id);
  }
}
