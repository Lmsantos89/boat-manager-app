import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle network errors or server not responding
      if (error.status === 0 || error.status === 503 || error.status === 504) {
        // 0: Network error (e.g., no response), 503: Service Unavailable, 504: Gateway Timeout
        authService.logout(); // Synchronous logout
        router.navigate(['/']); // Redirect to homepage
      }
      // Re-throw the error to allow components to handle it if needed
      return throwError(() => error);
    })
  );
};
