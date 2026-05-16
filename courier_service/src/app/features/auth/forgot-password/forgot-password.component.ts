import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  step = 1; // ১: ফোন ইনপুট, ২: ওটিপি ভেরিফাই, ৩: নতুন পাসওয়ার্ড
  phone = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  generatedOtp = '';

  sendOTP() {
    this.errorMessage = '';
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(this.phone)) {
      this.errorMessage = 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন।';
      return;
    }

    this.authService.sendOTP(this.phone).subscribe({
      next: (otp) => {
        this.generatedOtp = otp;
        alert(`[Mock SMS] Your OTP code is: ${otp}`); // টেস্ট করার সুবিধার জন্য অ্যালার্ট
        this.successMessage = 'আপনার ফোনে ওটিপি পাঠানো হয়েছে।';
        this.step = 2;
      },
      error: () => this.errorMessage = 'ওটিপি পাঠাতে ব্যর্থ হয়েছে।'
    });
  }

  verifyOTP() {
    this.errorMessage = '';
    this.authService.verifyOTP(this.phone, this.otp).subscribe({
      next: (isValid) => {
        if (isValid || this.otp === this.generatedOtp) {
          this.step = 3;
        } else {
          this.errorMessage = 'ভুল ওটিপি কোড।';
        }
      }
    });
  }

  resetPassword() {
    this.errorMessage = '';
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'পাসওয়ার্ড দুটি মিলছে না।';
      return;
    }
    
    // এখানে উদাহরণ হিসেবে আইডি '1' ব্যবহার করা হয়েছে, 
    // রিয়েল অ্যাপে ফোন দিয়ে ইউজার অবজেক্ট কুয়েরি করে আইডি বের করা হয়।
    this.authService.updateProfile('1', { password: this.newPassword }).subscribe({
      next: () => {
        alert('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।');
        this.router.navigate(['/login']);
      },
      error: () => this.errorMessage = 'পাসওয়ার্ড রিসেট করা যায়নি।'
    });
  }
}