import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // localStorage থেকে ইউজার ডাটা আনা
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  let authReq = req;

  // টোকেন থাকলে রিকোয়েস্ট ক্লোন করে হেডার যুক্ত করা
  if (user && user.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }

  // রিকোয়েস্ট পাঠানো এবং 401 এরর হ্যান্ডেল করা
  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // logout লজিক (localStorage ক্লিয়ার এবং লগইন পেজে রিডাইরেক্ট)
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};