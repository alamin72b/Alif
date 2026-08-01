import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type CreateTaskInput,
  type Task,
  taskSchema,
} from '@alif/contracts';

@Injectable()
export class TasksService {
  private readonly tasks = new Map<string, Task>();

  create(input: CreateTaskInput): Task {
    const timestamp = new Date().toISOString();

    const task = taskSchema.parse({
      id: randomUUID(),
      command: input.command,
      status: 'PENDING',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    this.tasks.set(task.id, task);

    return task;
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values()).sort((first, second) =>
      second.createdAt.localeCompare(first.createdAt),
    );
  }

  findOne(id: string): Task {
    const task = this.tasks.get(id);

    if (!task) {
      throw new NotFoundException({
        code: 'TASK_NOT_FOUND',
        message: `Task "${id}" was not found.`,
      });
    }

    return task;
  }
}