import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-update-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './update-status.component.html'
})
export class UpdateStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  parcelId: string | null = null;
  parcel: any = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Form Fields
  selectedStatus: string = '';
  deliveryNote: string = '';
  issueReason: string = '';

  // Options Matrix
  statusOptions = [
    { value: 'in_transit', label: 'In Transit (পরিবহনাধীন)' },
    { value: 'out_for_delivery', label: 'Out for Delivery (বিতরণের জন্য প্রস্তুত)' },
    { value: 'delivered', label: 'Delivered (সফলভাবে বিতরণকৃত)' },
    { value: 'cancelled', label: 'Report Issue / Cancel (সমস্যা/বাতিল)' }
  ];

  issueOptions = [
    { value: 'address_not_found', label: 'Address Not Found (ঠিকানা পাওয়া যায়নি)' },
    { value: 'customer_unavailable', label: 'Customer Unavailable (গ্রাহক অনুপস্থিত)' },
    { value: 'damaged_in_transit', label: 'Damaged (পণ্য ক্ষতিগ্রস্ত)' },
    { value: 'customer_refused', label: 'Customer Refused COD (টাকা দিতে অস্বীকৃতি)' }
  ];

  ngOnInit(): void {
    // Route থেকে parcelId রিসিভ করুন
    this.route.paramMap.subscribe(params => {
      this.parcelId = params.get('id');
      if (this.parcelId) {
        this.fetchParcelDetails(this.parcelId);
      }
    });
  }

  fetchParcelDetails(id: string): void {
    this.isLoading = true;
    this.http.get<any>(`http://localhost:3000/parcels/${id}`)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.parcel = data;
          this.selectedStatus = data.status;
        },
        error: () => this.router.navigate(['/rider/assigned-deliveries'])
      });
  }

  onStatusChange(): void {
    if (this.selectedStatus !== 'cancelled') {
      this.issueReason = '';
    }
  }

  submitStatusUpdate(): void {
    if (!this.parcelId || !this.selectedStatus) return;

    this.isSubmitting = true;

    // টাইমলাইন লগ তৈরি
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    let logNote = `Status updated to ${this.selectedStatus.replace('_', ' ')}`;
    
    if (this.selectedStatus === 'delivered' && this.deliveryNote) {
      logNote += ` - Note: ${this.deliveryNote}`;
    } else if (this.selectedStatus === 'cancelled' && this.issueReason) {
      logNote = `Issue Flagged: ${this.issueReason.replace('_', ' ')} - ${this.deliveryNote}`;
    }

    const newTimelineNode = {
      date: timestamp,
      status: this.selectedStatus,
      note: logNote,
      location: this.parcel.deliveryZone || 'Local Hub'
    };

    // আপডেট পেলোড মাস্কিং
    const updatedTimeline = [...(this.parcel.timeline || []), newTimelineNode];
    const payload: any = {
      status: this.selectedStatus,
      timeline: updatedTimeline
    };

    if (this.selectedStatus === 'cancelled') {
      payload.cancellationReason = this.issueReason;
      payload.paymentStatus = 'failed';
    } else if (this.selectedStatus === 'delivered') {
      payload.paymentStatus = this.parcel.paymentMethod === 'COD' ? 'paid' : this.parcel.paymentStatus;
    }

    // PATCH Request মেথড ট্রিগার
    this.http.patch(`http://localhost:3000/parcels/${this.parcelId}`, payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          // কাস্টমারকে নোটিফিকেশন পাঠানোর মক ট্রিগার
          this.sendCustomerNotification(this.selectedStatus);
          this.router.navigate(['/rider/assigned-deliveries']);
        }
      });
  }

  private sendCustomerNotification(status: string): void {
    const notificationPayload = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      customerId: this.parcel.customerId,
      trackingCode: this.parcel.trackingCode,
      message: `Your parcel ${this.parcel.trackingCode} operational checkpoint: ${status.replace('_', ' ').toUpperCase()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    this.http.post('http://localhost:3000/notifications', notificationPayload).subscribe();
  }
}