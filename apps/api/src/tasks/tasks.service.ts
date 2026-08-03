import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  type CreateTaskInput,
  type Task,
} from '@alif/contracts';

import { TaskQueuePublisher } from '../queue/task-queue.publisher';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly taskQueuePublisher: TaskQueuePublisher,
  ) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const task = await this.tasksRepository.create(input);

    try {
      await this.taskQueuePublisher.enqueue(task.id);
    } catch (error) {
      await this.markTaskAsFailedAfterQueueError(task.id);

      this.logger.error(
        `Could not enqueue task ${task.id}.`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException({
        code: 'TASK_QUEUE_UNAVAILABLE',
        message:
          'The task was stored but could not be submitted for processing.',
        taskId: task.id,
      });
    }

    const queuedTask =
      await this.tasksRepository.transitionStatus(
        task.id,
        ['PENDING'],
        'QUEUED',
      );

    if (queuedTask) {
      return queuedTask;
    }

    /*
     * The worker may claim a very fast job before the API changes
     * PENDING to QUEUED. In that race, return the newer database state
     * instead of overwriting it.
     */
    const currentTask =
      await this.tasksRepository.findOne(task.id);

    if (currentTask && currentTask.status !== 'PENDING') {
      return currentTask;
    }

    throw new InternalServerErrorException({
      code: 'TASK_QUEUE_STATUS_SYNC_FAILED',
      message:
        'The task was queued, but its database status could not be synchronized.',
      taskId: task.id,
    });
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

  private async markTaskAsFailedAfterQueueError(
    taskId: string,
  ): Promise<void> {
    try {
      await this.tasksRepository.transitionStatus(
        taskId,
        ['PENDING'],
        'FAILED',
      );
    } catch (error) {
      this.logger.error(
        `Could not mark task ${taskId} as failed.`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
