import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// import { AuthService } from '..services/auth.service';

export const riderGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = authService.getCurrentUser();
  if (currentUser?.role !== 'rider') {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};