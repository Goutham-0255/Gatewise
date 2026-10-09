import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Only our own API gets the token, never third-party URLs
  const isApiCall = req.url.startsWith(environment.apiUrl);
  const token = auth.getToken();
  const request =
    isApiCall && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const isLoginCall = req.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && isApiCall && !isLoginCall) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
