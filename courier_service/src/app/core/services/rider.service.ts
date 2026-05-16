import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ParcelService } from './parcel.service'; // একই ফোল্ডারে parcel.service.ts থাকা আবশ্যক

@Injectable({
  providedIn: 'root'
})
export class RiderService {
  private usersUrl = 'http://localhost:3000/users';
  private parcelsUrl = 'http://localhost:3000/parcels';
  private earningsUrl = 'http://localhost:3000/earnings';

  constructor(
    private http: HttpClient,
    private parcelService: ParcelService // updateDeliveryStatus মেথডের জন্য ইনজেক্ট করা হলো
  ) {}

  getAllRiders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersUrl}?role=rider`);
  }

  getRiderById(id: any): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/${id}`);
  }

  getAssignedParcels(riderId: any): Observable<any[]> {
    // picked-up এবং in-transit উভয় স্ট্যাটাসের পার্সেল একসাথে আনার জন্য forkJoin ব্যবহার করা হয়েছে
    const pickedUp$ = this.http.get<any[]>(`${this.parcelsUrl}?riderId=${riderId}&status=picked-up`);
    const inTransit$ = this.http.get<any[]>(`${this.parcelsUrl}?riderId=${riderId}&status=in-transit`);
    
    return forkJoin([pickedUp$, inTransit$]).pipe(
      map(([pickedUp, inTransit]) => [...pickedUp, ...inTransit])
    );
  }

  getPendingParcels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.parcelsUrl}?status=pending`);
  }

  acceptDelivery(parcelId: any, riderId: any): Observable<any> {
    const historyEntry = {
      status: 'picked-up',
      note: 'Rider accepted the delivery',
      location: 'Hub',
      timestamp: new Date().toISOString()
    };

    const updateData = {
      riderId,
      status: 'picked-up',
      updatedAt: new Date().toISOString(),
      $push: { history: historyEntry }
    };

    return this.http.patch<any>(`${this.parcelsUrl}/${parcelId}`, updateData);
  }

  updateDeliveryStatus(parcelId: any, status: string, note: string, location: string): Observable<any> {
    // রিকোয়ারমেন্ট অনুযায়ী সরাসরি parcelService এর updateStatus মেথড কল করা হয়েছে
    return this.parcelService.updateStatus(parcelId, status, note, location);
  }

  getEarnings(riderId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.earningsUrl}?riderId=${riderId}`);
  }

  getRiderStats(riderId: any): Observable<any> {
    return this.getEarnings(riderId).pipe(
      map((earnings: any[]) => {
        let totalDeliveries = 0;
        let totalEarnings = 0;
        let pendingEarnings = 0;

        earnings.forEach(record => {
          totalDeliveries++;
          if (record.status === 'paid' || record.status === 'completed') {
            totalEarnings += Number(record.amount || 0);
          } else if (record.status === 'pending') {
            pendingEarnings += Number(record.amount || 0);
          }
        });

        return {
          totalDeliveries,
          totalEarnings,
          pendingEarnings
        };
      })
    );
  }
}