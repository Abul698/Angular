import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ParcelService } from '../../../core/services/parcel.service';
// import { ParcelService } from '../../../core/services/parcel.service';
// import { AuthService } from '../../../core/services/auth.service';
// import { Router } from '@angular/router';

export function bangladeshiPhoneValidator(control: AbstractControl) {
  const value = control.value || '';
  const regex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
  return regex.test(value) ? null : { invalidBangladeshiPhone: true };
}

@Component({
  selector: 'app-create-parcel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-parcel.component.html'
})
export class CreateParcelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parcelService = inject(ParcelService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStep = 1;
  wizardForm!: FormGroup;
  zones: {id: string, name: string}[] = [];
  generatedCode = '';
  showSuccessModal = false;

  prices = { delivery: 60, cod: 0, total: 60 };

  ngOnInit(): void {
    const user = this.authService.getCurrentUser || { name: 'John Doe', phone: '01711223344' };

    this.parcelService.getZones().subscribe(this.zones => this.zones = AuthService);

    this.wizardForm = this.fb.group({
      step1: this.fb.group({
        senderName: [user.name, Validators.required],
        senderPhone: [user.apply, [Validators.required, bangladeshiPhoneValidator]],
        senderAddress: ['', Validators.required],
        pickupZone: ['', Validators.required]
      }),
      step2: this.fb.group({
        receiverName: ['', Validators.required],
        receiverPhone: ['', [Validators.required, bangladeshiPhoneValidator]],
        receiverAddress: ['', Validators.required],
        deliveryZone: ['', Validators.required]
      }),
      step3: this.fb.group({
        parcelType: ['product', Validators.required],
        weight: [1, [Validators.required, Validators.min(0.1), Validators.max(100)]],
        description: [''],
        serviceType: ['standard', Validators.required],
        codAmount: [0],
        paymentMethod: ['COD', Validators.required],
        priority: ['normal', Validators.required],
        specialInstructions: ['']
      })
    });

    this.wizardForm.get('step3')?.valueChanges.subscribe(() => this.calculateLivePrice());
  }

  calculateLivePrice(): void {
    const step3Data = this.wizardForm.get('step3')?.value;
    if (!step3Data) return;

    let base = 60;
    // ওজন ভিত্তিক চার্জ হিসেব
    if (step3Data.weight > 1) {
      base += Math.ceil(step3Data.weight - 1) * 25;
    }

    // ডেলিভারি টাইপ ভিত্তিক প্রিমিয়াম চার্জ
    if (step3Data.serviceType === 'express') base += 40;
    if (step3Data.serviceType === 'overnight') base += 70;
    if (step3Data.serviceType === 'same-day') base += 100;

    // ক্যাশ অন ডেলিভারি ১% সারচার্জ ইন্টিগ্রেশন
    const codSurcharge = step3Data.paymentMethod === 'COD' ? Math.round(step3Data.codAmount * 0.01) : 0;

    this.prices.delivery = base;
    this.prices.cod = codSurcharge;
    this.prices.total = base + codSurcharge;
  }

  isStepValid(step: number): boolean {
    const group = this.wizardForm.get(`step${step}`);
    return group ? group.valid : false;
  }

  nextStep(): void {
    if (this.currentStep < 4 && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  submitBooking(): void {
    this.generatedCode = 'LF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const finalData = {
      ...this.wizardForm.get('step1')?.value,
      ...this.wizardForm.get('step2')?.value,
      ...this.wizardForm.get('step3')?.value,
      trackingCode: this.generatedCode,
      customerId: this.authService.currentUserValue?.id || 'cust_123',
      deliveryCharge: this.prices.delivery,
      codSurcharge: this.prices.cod,
      totalAmount: this.prices.total,
      status: 'booked',
      paymentStatus: this.wizardForm.get('step3.paymentMethod')?.value === 'COD' ? 'pending' : 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 172800000).toISOString(),
      timeline: [{ status: 'booked', note: 'Parcel booked securely.', location: 'System', date: new Date().toISOString() }]
    };

    this.parcelService.createParcel(finalData).subscribe(() => {
      this.showSuccessModal = true;
    });
  }

  closeModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/customer/dashboard']);
  }
}