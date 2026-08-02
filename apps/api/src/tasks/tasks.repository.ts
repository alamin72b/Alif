import {
  type CreateTaskInput,
  type Task,
} from '@alif/contracts';

export abstract class TasksRepository {
  abstract create(input: CreateTaskInput): Promise<Task>;

  abstract findAll(): Promise<Task[]>;

  abstract findOne(id: string): Promise<Task | null>;
}
