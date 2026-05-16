// import { Injectable } from '@angular/core';
// import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {

//   constructor(private router: Router) {}

//   // আপনার দেওয়া লজিক অনুযায়ী:
//   // if !isLoggedIn() -> /login-এ পাঠাবে এবং false রিটার্ন করবে
//   // else return true
  
//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): boolean {
    
//     // isLoggedIn() ফাংশনটি আপনার সার্ভিস থেকে আসতে হবে, এখানে উদাহরণস্বরূপ দেখানো হলো
//     const loggedIn = this.isLoggedIn(); 

//     if (!loggedIn) {
//       this.router.navigate(['/login']);
//       return false;
//     }

//     return true;
//   }

//   // এই ফাংশনটি আপনার প্রয়োজন অনুযায়ী পরিবর্তন করে নেবেন (যেমন: localStorage চেক করা)
//   private isLoggedIn(): boolean {
//     // উদাহরণ: return !!localStorage.getItem('token');
//     return false; // ডিফল্ট হিসেবে false রাখা হয়েছে
//   }
// }
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
// import { AuthService } from './auth.service'; // আপনার সঠিক পাথ দিন

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};