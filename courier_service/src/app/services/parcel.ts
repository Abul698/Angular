// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class Parcel {}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublicParcelTrack } from '../core/models/parcel.model';
// import { PublicParcelTrack } from '../models/parcel.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/parcels';

  /**
   * ১. ড্যাশবোর্ডের জন্য অপ্টিমাইজড মেথড (শুধুমাত্র নির্দিষ্ট ইউজারের ডাটা আনবে)
   */
  getParcelsByCustomer(customerId: string): Observable<PublicParcelTrack[]> {
    const params = new HttpParams().set('customerId', customerId);
    return this.http.get<PublicParcelTrack[]>(this.apiUrl, { params });
  }

  /**
   * ২. পার্সেল হিস্ট্রির জন্য অ্যাডভান্সড ফিল্টারিং, সার্চ এবং পেজিনেশন মেথড
   * JSON Server-এর বিল্ট-ইন কিওয়ার্ড:
   * - _page: পেজ নাম্বার
   * - _limit: প্রতি পেজে কয়টি ডাটা দেখাবে
   * - _sort, _order: ডাটা সর্টিং (নতুন পার্সেল আগে দেখানোর জন্য)
   * - q: গ্লোবাল ফুল-টেক্সট সার্চ (ট্রেকিং কোড বা রিসিভারের নাম)
   */
  getFilteredParcels(filters: {
    customerId: string;
    status?: string;
    search?: string;
    page: number;
    limit: number;
  }): Observable<PublicParcelTrack[]> {
    let params = new HttpParams()
      .set('customerId', filters.customerId)
      .set('_page', filters.page.toString())
      .set('_limit', filters.limit.toString())
      .set('_sort', 'createdAt')
      .set('_order', 'desc'); // নতুন বুকিং করা পার্সেল সবার উপরে থাকবে

    // ইউজার যদি নির্দিষ্ট স্ট্যাটাস সিলেক্ট করে
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    // ইউজার যদি ট্রেকিং কোড বা রিসিভারের নাম লিখে সার্চ করে
    if (filters.search && filters.search.trim() !== '') {
      params = params.set('q', filters.search.trim());
    }

    return this.http.get<PublicParcelTrack[]>(this.apiUrl, { params });
  }

  /**
   * ৩. ক্যানসেল অর্ডার করার জন্য অপ্টিমাইজড প্যাচ (PATCH) মেthod
   */
  cancelParcel(parcelId: string, reason: string): Observable<PublicParcelTrack> {
    const payload = {
      status: 'cancelled',
      cancellationReason: reason
    };
    return this.http.patch<PublicParcelTrack>(`${this.apiUrl}/${parcelId}`, payload);
  }
}