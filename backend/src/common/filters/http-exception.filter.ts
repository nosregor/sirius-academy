import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Error response interface
 */
interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
}

/**
 * Global HTTP exception filter
 * Handles all HTTP exceptions and formats error responses consistently
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Extract error message from exception with type safety
   * @param exception - The caught exception
   * @returns Human-readable error message
   */
  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null) {
        // Handle class-validator errors (array of messages)
        if ('message' in response) {
          const msg = response.message;
          if (Array.isArray(msg)) {
            return msg.join(', ');
          }
          if (typeof msg === 'string') {
            return msg;
          }
        }
      }
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return 'Internal server error';
  }

  /**
   * Get error name/type for additional context
   * @param exception - The caught exception
   * @returns Error type or undefined
   */
  private getErrorType(exception: unknown): string | undefined {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'error' in response
      ) {
        return String(response.error);
      }
    }
    return undefined;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.getErrorMessage(exception);
    const errorType = this.getErrorType(exception);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errorType && { error: errorType }),
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(status).json(errorResponse);
  }
}
