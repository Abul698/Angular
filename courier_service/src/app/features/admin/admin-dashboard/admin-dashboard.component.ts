import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  // KPI Metrics
  totalDeliveries = 0;
  totalRevenue = 0;
  failedDeliveries = 0;
  activeRidersCount = 0;

  // Data Containers
  recentOrders: any[] = [];
  activeRiders: any[] = [];
  isLoading = true;

  // Mock Chart Labels for Scannable Visual Placeholders
  months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  deliveryTrends = [120, 145, 190, 220, 260, 310];
  statusDistribution = [
    { label: 'Pending', count: 14, color: 'bg-amber-500' },
    { label: 'In Transit', count: 28, color: 'bg-indigo-500' },
    { label: 'Delivered', count: 245, color: 'bg-emerald-500' },
    { label: 'Cancelled', count: 12, color: 'bg-rose-500' }
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // রিলেশনাল ডাটাবেজ থেকে ডেটা প্যারালাল ফেচিং
    forkJoin({
      parcels: this.http.get<any[]>('http://localhost:3000/parcels'),
      riders: this.http.get<any[]>('http://localhost:3000/parcels?_limit=5') // মক রাইডার লিস্ট
    }).subscribe({
      next: (res) => {
        const parcels = res.parcels;
        
        // KPI ক্যালকুলেশন লজিক
        this.totalDeliveries = parcels.filter(p => p.status === 'delivered').length;
        this.failedDeliveries = parcels.filter(p => p.status === 'cancelled').length;
        this.activeRidersCount = 5; // স্ট্যাটিক ডেমো কাউন্টার
        
        this.totalRevenue = parcels
          .filter(p => p.status === 'delivered')
          .reduce((sum, p) => sum + (p.deliveryCharge || 0) + (p.codSurcharge || 0), 0);

        // টেবিলের জন্য ডাটা ম্যাপিং (সর্বশেষ ১০টি অর্ডার)
        this.recentOrders = [...parcels]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        // একটিভ রাইডার ডাটা ম্যাকিং
        this.activeRiders = [
          { name: 'Kamil Ahmed', zone: 'Dhaka Central', currentLoads: 3, rating: '4.8 ★' },
          { name: 'Mahbub Alam', zone: 'Khulna Main Hub', currentLoads: 1, rating: '4.9 ★' },
          { name: 'Sajid Islam', zone: 'Dhaka North', currentLoads: 4, rating: '4.5 ★' }
        ];

        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // ইনলাইন স্ট্যাটাস আপডেট করার মেথড
  updateParcelStatus(parcelId: string, newStatus: string): void {
    this.http.patch(`http://localhost:3000/parcels/${parcelId}`, { status: newStatus })
      .subscribe(() => this.loadDashboardData());
  }
}