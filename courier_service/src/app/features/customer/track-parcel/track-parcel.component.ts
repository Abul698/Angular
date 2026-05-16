import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
 import { PublicParcelTrack } from '../../../core/models/parcel.model';

@Component({
  selector: 'app-track-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './track-parcel.component.html'
})
export class TrackParcelComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  searchCode: string = '';
  parcel: PublicParcelTrack | null = null;
  isLoading: boolean = false;
  hasSearched: boolean = false;

  // Visual Step Matrix for Step Progress Bar
  statusSteps = [
    { key: 'booked', label: 'Booked' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];

  ngOnInit(): void {
    // Route param (:code) চেক করুন এবং থাকলে অটো-সার্চ করুন
    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      if (code) {
        this.searchCode = code;
        this.getTrackingDetails(code);
      }
    });
  }

  onSearchSubmit(): void {
    if (!this.searchCode.trim()) return;
    
    // URL আপডেট করুন যাতে ইউজার লিংক শেয়ার করতে পারে
    this.router.navigate(['/track', this.searchCode.trim()]);
  }

  private getTrackingDetails(code: string): void {
    this.isLoading = true;
    this.hasSearched = true;
    this.parcel = null;

    // db.json বা ব্যাকএন্ড API থেকে ট্র্যাকিং কোড অনুযায়ী ফিল্টার করুন
    this.http.get<PublicParcelTrack[]>(`http://localhost:3000/parcels?trackingCode=${code}`)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.parcel = res[0];
          } else {
            this.parcel = null;
          }
        },
        error: () => {
          this.parcel = null;
        }
      });
  }

  // প্রোগ্রেস বার স্টেপ একটিভ কিনা তা নির্ধারণ করার মেথড
  getStepIndex(currentStatus: string): number {
    return this.statusSteps.findIndex(step => step.key === currentStatus);
  }

  // স্ট্যাটাস অনুসারে ব্যাজের টেইলউইন্ড ক্লাস জেনারেটর
  getStatusClass(status: string): string {
    const base = 'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ';
    switch (status) {
      case 'booked': return base + 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'picked_up': return base + 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'in_transit': return base + 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'out_for_delivery': return base + 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'delivered': return base + 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'cancelled': return base + 'bg-rose-50 text-rose-700 border border-rose-200';
      default: return base + 'bg-slate-50 text-slate-700';
    }
  }
}