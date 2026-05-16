import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-revenue-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue-reports.component.html'
})
export class RevenueReportsComponent implements OnInit {
  private http = inject(HttpClient);

  // Core Financial Accounts
  grossRevenue = 0;
  codCollected = 0;
  onlinePayments = 0;
  riderPayouts = 0;
  netProfit = 0;

  // Monthly Matrix Ledger
  monthlyBreakdown = [
    { month: 'May 2026', volume: 299, cod: 120000, online: 45000, payout: 18000, profit: 147000 },
    { month: 'April 2026', volume: 240, cod: 95000, online: 32000, payout: 14400, profit: 112600 },
    { month: 'March 2026', volume: 185, cod: 71000, online: 22000, payout: 11100, profit: 81900 }
  ];

  ngOnInit(): void {
    this.calculateFinances();
  }

  calculateFinances(): void {
    this.http.get<any[]>('http://localhost:3000/parcels?status=delivered')
      .subscribe({
        next: (parcels) => {
          parcels.forEach(p => {
            const charge = (p.deliveryCharge || 0) + (p.codSurcharge || 0);
            this.grossRevenue += charge;

            if (p.paymentMethod === 'COD') {
              this.codCollected += p.codAmount || 0;
            } else {
              this.onlinePayments += charge;
            }

            // মক রাইডার পেআউট ক্যালকুলেশন (৳ ৬০ ফিক্সড পার ড্রপ)
            this.riderPayouts += 60;
          });

          this.netProfit = this.grossRevenue - this.riderPayouts;
        }
      });
  }

  triggerPrint(): void {
    // window.print() ব্রাউজার প্রিন্ট ডায়ালগ অ্যাক্টিভেট করে
    window.print();
  }
}