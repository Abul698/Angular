import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // এখানে ধরে নেওয়া হয়েছে authService-এ hasRole মেথডটি আছে
  const isManager = authService.hasRole('manager'); 
  const isAdmin = authService.isAdmin();

  if (!isAdmin && !isManager) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};