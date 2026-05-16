import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  getByUser(userId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?userId=${userId}`);
  }

  getUnreadCount(userId: any): Observable<number> {
    return this.getByUser(userId).pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }

  markAsRead(id: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, { read: true });
  }

  markAllRead(userId: any): Observable<any[]> {
    // প্রথমে ইউজারের সব নোটিফিকেশন আনা হচ্ছে, তারপর আনরিডগুলো ফিল্টার করে একসাথে আপডেট করা হচ্ছে
    return this.getByUser(userId).pipe(
      switchMap(notifications => {
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) {
          return of([]);
        }
        
        // প্রতিটি আনরিড নোটিফিকেশনের জন্য PATCH রিকোয়েস্ট তৈরি করা হচ্ছে
        const requests = unreadNotifications.map(n => this.markAsRead(n.id));
        return forkJoin(requests);
      })
    );
  }

  send(notification: any): Observable<any> {
    const newNotification = {
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    };
    return this.http.post<any>(this.baseUrl, newNotification);
  }

  sendParcelNotification(customerId: any, parcelStatus: string, trackingCode: string): Observable<any> {
    let title = 'পার্সেল আপডেট (Parcel Update)';
    let message = '';

    // স্ট্যাটাস অনুযায়ী মেসেজ অটো-জেনারেট করার লজিক
    switch (parcelStatus?.toLowerCase()) {
      case 'pending':
        message = `আপনার পার্সেল (Tracking Code: ${trackingCode}) সফলভাবে তৈরি হয়েছে এবং পেন্ডিং অবস্থায় আছে।`;
        break;
      case 'picked-up':
        message = `রাইডার আপনার পার্সেলটি (Tracking Code: ${trackingCode}) পিক-আপ করেছেন।`;
        break;
      case 'in-transit':
        message = `আপনার পার্সেলটি (Tracking Code: ${trackingCode}) গন্তব্যের উদ্দেশ্যে রওনা হয়েছে।`;
        break;
      case 'delivered':
        title = 'পার্সেল ডেলিভারি সফল (Delivery Successful)';
        message = `অভিনন্দন! আপনার পার্সেলটি (Tracking Code: ${trackingCode}) সফলভাবে ডেলিভারি করা হয়েছে।`;
        break;
      case 'cancelled':
        title = 'পার্সেল বাতিল (Parcel Cancelled)';
        message = `দুঃখিত, আপনার পার্সেলটি (Tracking Code: ${trackingCode}) বাতিল করা হয়েছে।`;
        break;
      default:
        message = `আপনার পার্সেলটির (Tracking Code: ${trackingCode}) স্ট্যাটাস পরিবর্তন হয়ে এখন '${parcelStatus}' এ আছে।`;
    }

    const notificationPayload = {
      userId: customerId,
      title,
      message,
      type: 'parcel',
      status: parcelStatus
    };

    return this.send(notificationPayload);
  }
}