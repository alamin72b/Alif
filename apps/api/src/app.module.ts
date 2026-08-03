import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateRuntimeEnvironment } from '@alif/config';

import { TasksController } from './app.controller';
import { QueueInfrastructureModule } from './queue/queue-infrastructure.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateRuntimeEnvironment,
    }),
    QueueInfrastructureModule,
    TasksModule,
  ],
  controllers: [TasksController],
})
export class AppModule {}