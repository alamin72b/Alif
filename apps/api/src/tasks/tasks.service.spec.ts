import { randomUUID } from 'node:crypto';

import { NotFoundException } from '@nestjs/common';
import type { Task } from '@alif/contracts';

import { TaskQueuePublisher } from '../queue/task-queue.publisher';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let repository: jest.Mocked<TasksRepository>;
  let taskQueuePublisher: jest.Mocked<TaskQueuePublisher>;
  let service: TasksService;

  const task: Task = {
    id: randomUUID(),
    command: 'Open Google and search for Project Alif',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      transitionStatus: jest.fn(),
    };

    taskQueuePublisher = {
      enqueue: jest.fn(),
    } as unknown as jest.Mocked<TaskQueuePublisher>;

    service = new TasksService(repository, taskQueuePublisher);
  });

  it('creates a task through the repository', async () => {
    repository.create.mockResolvedValue(task);
    taskQueuePublisher.enqueue.mockResolvedValue(task.id);
    repository.transitionStatus.mockResolvedValue({
      ...task,
      status: 'QUEUED',
    });

    await expect(
      service.create({
        command: task.command,
      }),
    ).resolves.toEqual({
      ...task,
      status: 'QUEUED',
    });

    expect(repository.create).toHaveBeenCalledWith({
      command: task.command,
    });
    expect(taskQueuePublisher.enqueue).toHaveBeenCalledWith(task.id);
  });

  it('returns tasks from the repository', async () => {
    repository.findAll.mockResolvedValue([task]);

    await expect(service.findAll()).resolves.toEqual([task]);
  });

  it('returns an existing task', async () => {
    repository.findOne.mockResolvedValue(task);

    await expect(service.findOne(task.id)).resolves.toEqual(task);
  });

  it('throws when the task does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(randomUUID())).rejects.toThrow(
      NotFoundException,
    );
  });
});
