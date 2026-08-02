import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateDatabaseEnvironment } from '@alif/config';

import { TasksController } from './app.controller';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateDatabaseEnvironment,
    }),
    TasksModule,
  ],
  controllers: [TasksController],
})
export class AppModule {}
