import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type CreateTaskInput,
  type Task,
} from '@alif/contracts';

import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
  ) {}

  create(input: CreateTaskInput): Promise<Task> {
    return this.tasksRepository.create(input);
  }

  findAll(): Promise<Task[]> {
    return this.tasksRepository.findAll();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne(id);

    if (!task) {
      throw new NotFoundException({
        code: 'TASK_NOT_FOUND',
        message: `Task "${id}" was not found.`,
      });
    }

    return task;
  }
}