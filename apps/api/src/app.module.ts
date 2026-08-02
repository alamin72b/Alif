import { Module } from '@nestjs/common';

import { TasksController } from './app.controller';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule],
  controllers: [TasksController],
})
export class AppModule {}
