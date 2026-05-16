import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ParcelService } from '../../../core/services/parcel.service';
import { AuthService } from '../../../core/services/auth.service';
import { Parcel } from '../../../core/models/parcel.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './customer-dashboard.component.html'
})
export class CustomerDashboardComponent implements OnInit {
  private parcelService = inject(ParcelService);
  private authService = inject(AuthService);
  private router = inject(Router);

  parcels: Parcel[] = [];
  recentParcels: Parcel[] = [];
  pendingPayments: Parcel[] = [];
  trackCode: string = '';

  stats = { total: 0, inTransit: 0, delivered: 0, pending: 0 };

  ngOnInit(): void {
    const user = this.authService.getCurrentUser; // আপনার Auth implementation অনুযায়ী নিন
    const customerId = user?.id || 'cust_123'; // Fallback mock id if empty

    this.parcelService.assignRider(customerId).subscribe(data => {
      this.parcels = data;
      this.calculateStats();
      this.recentParcels = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
      this.pendingPayments = data.filter(p => p.paymentStatus === 'pending');
    });
  }

  calculateStats(): void {
    this.stats.total = this.parcels.length;
    this.stats.inTransit = this.parcels.filter(p => p.status === 'in_transit' || p.status === 'picked_up').length;
    this.stats.delivered = this.parcels.filter(p => p.status === 'delivered').length;
    this.stats.pending = this.parcels.filter(p => p.status === 'pending' || p.status === 'booked').length;
  }

  onQuickTrack(): void {
    if (this.trackCode.trim()) {
      this.router.navigate(['/track', this.trackCode.trim()]);
    }
  }

  getStatusClass(status: string): string {
    const base = 'px-2.5 py-1 text-xs font-semibold rounded-full ';
    switch(status) {
      case 'delivered': return base + 'bg-emerald-100 text-emerald-800';
      case 'in_transit': return base + 'bg-blue-100 text-blue-800';
      case 'cancelled': return base + 'bg-rose-100 text-rose-800';
      default: return base + 'bg-amber-100 text-amber-800';
    }
  }
}