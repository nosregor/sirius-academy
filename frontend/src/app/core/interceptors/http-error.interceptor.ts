import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * HTTP Error Interceptor
 *
 * Intercepts all HTTP responses and handles errors globally.
 * Provides consistent error handling across the application.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side or network error
          errorMessage = `Network error: ${error.error.message}`;
        } else {
          // Backend returned an unsuccessful response code
          if (error.error?.message) {
            // NestJS error format
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join(', ');
            } else {
              errorMessage = error.error.message;
            }
          } else {
            errorMessage = `Server error: ${error.status} ${error.statusText}`;
          }
        }

        // Log error to console for debugging
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error,
        });

        // Return error observable with user-friendly message
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          originalError: error,
        }));
      }),
    );
  }
}
