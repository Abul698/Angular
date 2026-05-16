import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './otp-verify.component.html'
})
export class OtpVerifyComponent implements OnInit {
  private router = inject(Router);
  
  @ViewChildren('otpInput') inputs!: QueryList<ElementRef>;
  
  otpDigits: string[] = ['', '', '', '', '', ''];
  countdown = 60;
  timer: any;
  errorMessage = '';

  ngOnInit() {
    this.startTimer();
  }

  startTimer() {
    this.countdown = 60;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  onInput(event: any, index: number) {
    const val = event.target.value;
    if (val && index < 5) {
      // পরবর্তী ইনপুট বক্সে অটো-ফোকাস করা
      setTimeout(() => this.inputs.toArray()[index + 1].nativeElement.focus(), 10);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      // ব্যাকস্পেস চাপলে পূর্ববর্তী ইনপুট বক্সে অটো-ফোকাস করা
      this.inputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  resendOTP() {
    if (this.countdown === 0) {
      alert('নতুন ওটিপি পাঠানো হয়েছে।');
      this.startTimer();
    }
  }

  verify() {
    const fullOtp = this.otpDigits.join('');
    if (fullOtp.length < 6) {
      this.errorMessage = '৬টি ডিজিটই সম্পূর্ণ করুন।';
      return;
    }
    
    // টেস্ট ভেরিফিকেশন (Mock verification success)
    alert(`OTP Verified Successfully: ${fullOtp}`);
    this.router.navigate(['/customer/dashboard']);
  }
}