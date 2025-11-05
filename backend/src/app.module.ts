import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config/database.config';

import { Lesson } from './entities/lesson.entity';
import { Student } from './entities/student.entity';
import { Teacher } from './entities/teacher.entity';
import { User } from './entities/user.entity';

import { LessonsModule } from './lessons/lessons.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
/**
 * Root application module
 * Configures global modules, database connection, and core services
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
    // TypeORM database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config =
          configService.get<import('@nestjs/typeorm').TypeOrmModuleOptions>(
            'database',
          );
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return {
          ...config,
          entities: [Lesson, Student, Teacher, User],
          synchronize: true, // Ensure this is true during development
          logging: true, // Enable to see what's happening
        };
      },
    }),
    LessonsModule,
    StudentsModule,
    TeachersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
