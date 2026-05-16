import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private parcelsUrl = 'http://localhost:3000/parcels';
  private paymentsUrl = 'http://localhost:3000/payments';
  private usersUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getKPIs(): Observable<any> {
    const parcels$ = this.http.get<any[]>(this.parcelsUrl);
    const payments$ = this.http.get<any[]>(this.paymentsUrl);
    const riders$ = this.http.get<any[]>(`${this.usersUrl}?role=rider&status=active`);

    return forkJoin([parcels$, payments$, riders$]).pipe(
      map(([parcels, payments, riders]) => {
        const totalDeliveries = parcels.length;
        const deliveredCount = parcels.filter(p => p.status?.toLowerCase() === 'delivered').length;
        
        const failedCount = parcels.filter(p => 
          p.status?.toLowerCase() === 'cancelled' || p.status?.toLowerCase() === 'returned'
        ).length;

        const inTransitCount = parcels.filter(p => 
          p.status?.toLowerCase() === 'in-transit' || 
          p.status?.toLowerCase() === 'picked-up' || 
          p.status?.toLowerCase() === 'out-for-delivery'
        ).length;

        const totalRevenue = payments
          .filter(p => p.status?.toLowerCase() === 'success' || p.status?.toLowerCase() === 'completed')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const pendingRevenue = parcels
          .filter(p => p.serviceType?.toLowerCase() === 'cod' && p.paymentStatus?.toLowerCase() === 'pending')
          .reduce((sum, p) => sum + Number(p.codAmount || 0), 0);

        const activeRiders = riders.length;

        return {
          totalDeliveries,
          deliveredCount,
          failedCount,
          inTransitCount,
          totalRevenue,
          pendingRevenue,
          activeRiders
        };
      })
    );
  }

  getMonthlyRevenue(): Observable<any> {
    return this.http.get<any[]>(this.paymentsUrl).pipe(
      map(payments => {
        const monthlyData: { [key: string]: number } = {};

        payments
          .filter(p => p.status?.toLowerCase() === 'success' || p.status?.toLowerCase() === 'completed')
          .forEach(p => {
            const date = new Date(p.createdAt);
            if (!isNaN(date.getTime())) {
              // Format: YYYY-MM (e.g., 2026-05)
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(p.amount || 0);
            }
          });

        return monthlyData;
      })
    );
  }

  getDeliveryByStatus(): Observable<any> {
    return this.http.get<any[]>(this.parcelsUrl).pipe(
      map(parcels => {
        const statusData: { [key: string]: number } = {};

        parcels.forEach(p => {
          const status = p.status || 'unknown';
          statusData[status] = (statusData[status] || 0) + 1;
        });

        return statusData;
      })
    );
  }

  getTopRiders(): Observable<any[]> {
    const parcels$ = this.http.get<any[]>(this.parcelsUrl);
    const riders$ = this.http.get<any[]>(`${this.usersUrl}?role=rider`);

    return forkJoin([parcels$, riders$]).pipe(
      map(([parcels, riders]) => {
        const riderDeliveryCount: { [key: string]: number } = {};

        // প্রতিটি রাইডারের মোট সফল ডেলিভারি গণনা
        parcels
          .filter(p => p.riderId && p.status?.toLowerCase() === 'delivered')
          .forEach(p => {
            riderDeliveryCount[p.riderId] = (riderDeliveryCount[p.riderId] || 0) + 1;
          });

        // রাইডারদের ডেটার সাথে ডেলিভারি কাউন্ট ম্যাপ করা
        const ridersWithCounts = riders.map(rider => ({
          id: rider.id,
          name: rider.name,
          email: rider.email,
          totalDeliveries: riderDeliveryCount[rider.id] || 0
        }));

        // ডেলিভারি সংখ্যার ওপর ভিত্তি করে ক্রমানুসারে (Descending) সাজানো
        return ridersWithCounts.sort((a, b) => b.totalDeliveries - a.totalDeliveries);
      })
    );
  }

  getRevenueByGateway(): Observable<any> {
    return this.http.get<any[]>(this.paymentsUrl).pipe(
      map(payments => {
        const gatewayData: { [key: string]: number } = {};

        payments
          .filter(p => p.status?.toLowerCase() === 'success' || p.status?.toLowerCase() === 'completed')
          .forEach(p => {
            const method = p.method || 'unknown';
            gatewayData[method] = (gatewayData[method] || 0) + Number(p.amount || 0);
          });

        return gatewayData;
      })
    );
  }
}