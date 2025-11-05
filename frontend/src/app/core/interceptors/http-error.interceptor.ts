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

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Network error: ${error.error.message}`;
        } else {
          if (error.error?.message) {
            if (Array.isArray(error.error.message)) {
              errorMessage = error.error.message.join(', ');
            } else {
              errorMessage = error.error.message;
            }
          } else {
            errorMessage = `Server error: ${error.status} ${error.statusText}`;
          }
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error,
        });

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          originalError: error,
        }));
      }),
    );
  }
}
