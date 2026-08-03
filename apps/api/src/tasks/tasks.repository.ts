import {
  type CreateTaskInput,
  type Task,
  type TaskStatus,
} from '@alif/contracts';

export abstract class TasksRepository {
  abstract create(input: CreateTaskInput): Promise<Task>;

  abstract findAll(): Promise<Task[]>;

  abstract findOne(id: string): Promise<Task | null>;

  abstract transitionStatus(
    id: string,
    fromStatuses: readonly TaskStatus[],
    toStatus: TaskStatus,
  ): Promise<Task | null>;
}
