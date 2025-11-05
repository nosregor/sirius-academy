import { Module } from '@nestjs/common';

/**
 * Common module for shared utilities, filters, guards, and interceptors
 * This module can be imported by other modules to access shared functionality
 */
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class CommonModule {}

