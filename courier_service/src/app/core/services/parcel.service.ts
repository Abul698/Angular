import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private baseUrl = 'http://localhost:3000/parcels';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getByCustomer(customerId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?customerId=${customerId}`);
  }

  getByRider(riderId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?riderId=${riderId}`);
  }

  getByTracking(code: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?trackingCode=${code}`);
  }

  getById(id: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(parcel: any): Observable<any> {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000);
    const trackingCode = `CRD-${year}-${String(random).padStart(3, '0')}`;

    const newParcel = {
      ...parcel,
      trackingCode,
      status: parcel.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: parcel.history || []
    };

    return this.http.post<any>(this.baseUrl, newParcel);
  }

  updateStatus(id: any, status: string, note: string, location: string): Observable<any> {
    const historyEntry = {
      status,
      note,
      location,
      timestamp: new Date().toISOString()
    };

    // দ্রষ্টব্য: JSON Server ব্যাকএন্ড হলে অবজেক্টের ভেতরের অ্যারেতে সরাসরি push করার জন্য 
    // প্রথমে কারেন্ট পার্সেল ডেটা গেট (GET) করে হিস্ট্রি আপডেট করে PATCH করতে হতে পারে।
    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      // নিচে উদাহরণস্বরূপ সরাসরি অবজেক্ট পাঠানো হলো, আপনার ব্যাকএন্ড স্ট্রাকচার অনুযায়ী এটি কাজ করবে
      $push: { history: historyEntry } 
    };

    return this.http.patch<any>(`${this.baseUrl}/${id}`, updateData);
  }

  assignRider(parcelId: any, riderId: any): Observable<any> {
    const updateData = {
      riderId,
      updatedAt: new Date().toISOString()
    };
    return this.http.patch<any>(`${this.baseUrl}/${parcelId}`, updateData);
  }

  cancel(id: any): Observable<any> {
    const updateData = {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };
    return this.http.patch<any>(`${this.baseUrl}/${id}`, updateData);
  }

  delete(id: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  calculateCharge(weight: number, serviceType: string, codAmount: number): number {
    let baseRate = 0;
    let perKgRate = 0;

    switch (serviceType?.toLowerCase()) {
      case 'standard':
        baseRate = 60;
        perKgRate = 20;
        break;
      case 'express':
        baseRate = 100;
        perKgRate = 35;
        break;
      case 'overnight':
        baseRate = 180;
        perKgRate = 50;
        break;
      case 'same-day':
        baseRate = 250;
        perKgRate = 60;
        break;
      default:
        baseRate = 60;
        perKgRate = 20;
    }

    const deliveryCharge = baseRate + (weight * perKgRate);
    const codSurcharge = codAmount > 0 ? (codAmount * 0.015) : 0;

    return deliveryCharge + codSurcharge;
  }
}