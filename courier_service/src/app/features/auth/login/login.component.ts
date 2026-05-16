// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   imports: [],
//   templateUrl: './login.html',
//   styleUrl: './login.css',
// })
// export class Login {}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;
  errorMessage = '';
  showDemo = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  setDemo(email: string, pass: string) {
    this.email = email;
    this.password = pass;
  }

  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          const role = user.role?.toLowerCase();
          if (role === 'admin' || role === 'manager') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'rider') {
            this.router.navigate(['/rider/dashboard']);
          } else {
            this.router.navigate(['/customer/dashboard']);
          }
        } else {
          this.errorMessage = 'ইমেইল অথবা পাসওয়ার্ডটি সঠিক নয়।';
        }
      },
      error: () => this.errorMessage = 'সার্ভারে সমস্যা হচ্ছে। আবার চেষ্টা করুন।'
    });
  }
}