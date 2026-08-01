import { randomUUID } from 'node:crypto';

import { NotFoundException } from '@nestjs/common';

import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('creates a pending task', () => {
    const task = service.create({
      command: 'Open Google and search for Project Alif',
    });

    expect(task.id).toEqual(expect.any(String));
    expect(task.command).toBe(
      'Open Google and search for Project Alif',
    );
    expect(task.status).toBe('PENDING');
    expect(task.createdAt).toEqual(expect.any(String));
    expect(task.updatedAt).toBe(task.createdAt);
  });

  it('returns created tasks', () => {
    const task = service.create({
      command: 'Test the Alif task API',
    });

    expect(service.findAll()).toEqual([task]);
    expect(service.findOne(task.id)).toEqual(task);
  });

  it('throws when a task does not exist', () => {
    expect(() => service.findOne(randomUUID())).toThrow(
      NotFoundException,
    );
  });
});