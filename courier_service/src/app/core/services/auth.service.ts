import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/users?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users && users.length > 0) {
            localStorage.setItem('courier_user', JSON.stringify(users[0]));
            return users[0];
          }
          return null;
        })
      );
  } 

  register(user: any): Observable<any> {
    const newUser = { 
      ...user, 
      role: 'customer', 
      status: 'active',
      token: `jwt-customer-${Date.now()}` 
    };
    return this.http.post(`${this.baseUrl}/users`, newUser);
  }

  logout() {
    localStorage.removeItem('courier_user');
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    const user = localStorage.getItem('courier_user');
    return user ? JSON.parse(user) : null;
  }

  // --- নতুন মেথডসমূহ (যা কমেন্টের রিকোয়ারমেন্ট অনুযায়ী যোগ করা হলো) ---

  isLoggedIn(): boolean {
    return localStorage.getItem('courier_user') !== null;
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.role === role;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  isRider(): boolean {
    return this.getCurrentUser()?.role === 'rider';
  }

  isCustomer(): boolean {
    return this.getCurrentUser()?.role === 'customer';
  }

  updateProfile(id: any, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}`, data);
  }

  sendOTP(phone: string): Observable<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // ৬ ডিজিটের OTP
    const payload = { phone, otp, createdAt: new Date().toISOString() };
    
    return this.http.post(`${this.baseUrl}/otpStore`, payload).pipe(
      map(() => otp) // ওটিপি স্ট্রিং রিটার্ন করবে
    );
  }

  verifyOTP(phone: string, otp: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.baseUrl}/otpStore?phone=${phone}&otp=${otp}`).pipe(
      map(records => records && records.length > 0) // রেকর্ড খুঁজে পেলে true, না পেলে false
    );
  }
}