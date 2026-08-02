import {
  taskSchema,
  type Task,
} from '@alif/contracts';
import type { Task as DatabaseTask } from '@alif/database';

export function mapDatabaseTask(
  databaseTask: DatabaseTask,
): Task {
  return taskSchema.parse({
    id: databaseTask.id,
    command: databaseTask.command,
    status: databaseTask.status,
    createdAt: databaseTask.createdAt.toISOString(),
    updatedAt: databaseTask.updatedAt.toISOString(),
  });
}
