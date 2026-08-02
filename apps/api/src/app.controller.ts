import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  createTaskSchema,
  type CreateTaskInput,
  type Task,
} from '@alif/contracts';

import { ZodValidationPipe } from './common/pipes/zod-validation.pipe';
import { TasksService } from './tasks/tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createTaskSchema))
    input: CreateTaskInput,
  ): Promise<Task> {
    return this.tasksService.create(input);
  }

  @Get()
  findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<Task> {
    return this.tasksService.findOne(id);
  }
}
