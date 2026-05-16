// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-register',
//   imports: [],
//   templateUrl: './register.html',
//   styleUrl: './register.css',
// })
// export class Register {}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = '';
  phone = '';
  email = '';
  password = '';
  confirmPassword = '';
  address = '';
  agreeTerms = false;
  errorMessage = '';
  passwordStrength = 'weak'; // weak, medium, strong

  checkPasswordStrength() {
    const pass = this.password;
    if (pass.length < 6) {
      this.passwordStrength = 'weak';
    } else if (pass.length >= 6 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      this.passwordStrength = 'strong';
    } else {
      this.passwordStrength = 'medium';
    }
  }

  onSubmit() {
    this.errorMessage = '';
    const phoneRegex = /^01[3-9]\d{8}$/;
    
    if (!phoneRegex.test(this.phone)) {
      this.errorMessage = 'সঠিক বাংলাদেশি মোবাইল নম্বর (যেমন: 017XXXXXXXX) দিন।';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'পাসওয়ার্ড দুটি মিলছে না।';
      return;
    }

    const userData = {
      name: this.fullName,
      phone: this.phone,
      email: this.email,
      password: this.password,
      address: this.address
    };

    this.authService.register(userData).subscribe({
      next: () => {
        // অটো লগইন সিমুলেশন এবং ড্যাশবোর্ডে রিডাইরেক্ট
        this.authService.login(this.email, this.password).subscribe(() => {
          this.router.navigate(['/customer/dashboard']);
        });
      },
      error: () => this.errorMessage = 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।'
    });
  }
}