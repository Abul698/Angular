import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface Parcel {
  id: string;
  trackingCode: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryCharge: number;
  codSurcharge: number;
  totalAmount: number;
  paymentStatus: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './payment.component.html'
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  parcelId: string | null = null;
  parcel: Parcel | null = null;
  isLoading = true;
  errorMessage = '';

  // Payment Status Control
  activeTab: 'bkash' | 'nagad' | 'ssl' | 'cod' = 'bkash';
  paymentStep: 'input' | 'otp' | 'success' = 'input';
  transactionId = '';

  // Form Groups
  bkashForm!: FormGroup;
  nagadForm!: FormGroup;
  sslForm!: FormGroup;

  // Constants
  private readonly API_URL = 'http://localhost:3000'; // db.json endpoint URL

  ngOnInit(): void {
    this.initForms();
    this.route.paramMap.subscribe(params => {
      this.parcelId = params.get('parcelId');
      if (this.parcelId) {
        this.loadParcelDetails(this.parcelId);
      }
    });
  }

  private initForms(): void {
    this.bkashForm = this.fb.group({
      walletNumber: ['', [Validators.required, Validators.pattern(/^(?:\+8801|01)[3-9]\d{8}$/)]],
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      otp: ['']
    });

    this.nagadForm = this.fb.group({
      walletNumber: ['', [Validators.required, Validators.pattern(/^(?:\+8801|01)[3-9]\d{8}$/)]],
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      otp: ['']
    });

    this.sslForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardName: ['', Validators.required],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  private loadParcelDetails(id: string): void {
    this.isLoading = true;
    this.http.get<Parcel>(`${this.API_URL}/parcels/${id}`).pipe(
      catchError(error => {
        this.errorMessage = 'পার্সেল ডাটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe(data => {
      if (data) {
        this.parcel = data;
        if (data.paymentStatus === 'paid') {
          this.paymentStep = 'success';
          this.transactionId = 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        }
      }
      this.isLoading = false;
    });
  }

  switchTab(tab: 'bkash' | 'nagad' | 'ssl' | 'cod'): void {
    if (this.paymentStep === 'success') return;
    this.activeTab = tab;
    this.paymentStep = 'input';
  }

  submitWalletPayment(): void {
    const currentForm = this.activeTab === 'bkash' ? this.bkashForm : this.nagadForm;
    if (currentForm.invalid) {
      currentForm.markAllAsTouched();
      return;
    }
    
    // Simulate OTP step change
    this.paymentStep = 'otp';
    currentForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
    currentForm.get('otp')?.updateValueAndValidity();
  }

  confirmOtpPayment(): void {
    const currentForm = this.activeTab === 'bkash' ? this.bkashForm : this.nagadForm;
    if (currentForm.get('otp')?.invalid) {
      return;
    }
    this.executePaymentSimulation('Paid');
  }

  submitCardPayment(): void {
    if (this.sslForm.invalid) {
      this.sslForm.markAllAsTouched();
      return;
    }
    this.executePaymentSimulation('Paid');
  }

  confirmCodPayment(): void {
    this.executePaymentSimulation('Pending');
  }

  private executePaymentSimulation(finalStatus: 'Paid' | 'Pending'): void {
    if (!this.parcel) return;
    this.isLoading = true;

    const generatedTxnId = finalStatus === 'Paid' ? 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase() : 'COD-PENDING';

    const paymentPayload = {
      parcelId: this.parcel.id,
      trackingCode: this.parcel.trackingCode,
      amount: this.parcel.totalAmount,
      method: this.activeTab.toUpperCase(),
      transactionId: generatedTxnId,
      status: finalStatus,
      createdAt: new Date().toISOString()
    };

    // Parallel processing: Update parcel payment status and create payment record
    forkJoin({
      patchParcel: this.http.patch(`${this.API_URL}/parcels/${this.parcel.id}`, { paymentStatus: finalStatus.toLowerCase() }),
      postPayment: this.http.post(`${this.API_URL}/payments`, paymentPayload)
    }).pipe(
      catchError(err => {
        this.errorMessage = 'পেমেন্ট প্রসেস সম্পন্ন করা যায়নি। পুনরায় ট্রাই করুন।';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.transactionId = generatedTxnId;
        this.paymentStep = 'success';
        if (this.parcel) {
          this.parcel.paymentStatus = finalStatus.toLowerCase();
        }
      }
      this.isLoading = false;
    });
  }

  triggerPrint(): void {
    window.print();
  }
}