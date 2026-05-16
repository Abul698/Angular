import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:3000/payments';
  private parcelUrl = 'http://localhost:3000/parcels'; // ইনভয়েস জেনারেট করার জন্য প্রয়োজন

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getByCustomer(customerId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?customerId=${customerId}`);
  }

  getByParcel(parcelId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}?parcelId=${parcelId}`);
  }

  initiatePayment(parcelId: any, method: string, amount: number, customerId: any): Observable<any> {
    const paymentData = {
      parcelId,
      customerId,
      method,
      amount,
      createdAt: new Date().toISOString(),
      transactionId: method !== 'cod' ? `TXN-${method.toUpperCase()}-${Date.now()}` : null
    };

    // গেটওয়ে সিমুলেশন লজিক
    switch (method.toLowerCase()) {
      case 'bkash':
        alert(`[bKash Gateway] Simulating OTP & PIN verification for ৳${amount}`);
        return of({ success: true }).pipe(
          delay(1500), // ১.৫ সেকেন্ড গেটওয়ে লোডিং সিমুলেট করবে
          switchMap(() => {
            const finalData = { ...paymentData, status: 'completed' };
            return this.http.post<any>(this.baseUrl, finalData);
          })
        );

      case 'nagad':
        alert(`[Nagad Gateway] Simulating Nagad Portal flow for ৳${amount}`);
        return of({ success: true }).pipe(
          delay(1500),
          switchMap(() => {
            const finalData = { ...paymentData, status: 'completed' };
            return this.http.post<any>(this.baseUrl, finalData);
          })
        );

      case 'sslcommerz':
        alert(`[SSLCommerz] Redirecting to SSL Sandbox Gateway for ৳${amount}...`);
        return of({ success: true }).pipe(
          delay(2000), // রিডাইরেক্ট ফিল দেওয়ার জন্য ২ সেকেন্ড ডিলে
          switchMap(() => {
            const finalData = { ...paymentData, status: 'completed' };
            return this.http.post<any>(this.baseUrl, finalData);
          })
        );

      case 'cod':
      default:
        // Cash on Delivery (COD) এর জন্য কোনো গেটওয়ে পপআপ দরকার নেই, সরাসরি পেন্ডিং থাকবে
        const codData = { ...paymentData, status: 'pending' };
        return this.http.post<any>(this.baseUrl, codData);
    }
  }

  generateInvoice(paymentId: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${paymentId}`).pipe(
      switchMap(payment => {
        // পেমেন্ট ডেটার সাথে পার্সেলের তথ্য লিঙ্ক করার জন্য পার্সেল এপিআই কল করা হচ্ছে
        return this.http.get<any>(`${this.parcelUrl}/${payment.parcelId}`).pipe(
          switchMap(parcel => {
            const invoice = {
              invoiceNumber: `INV-${Date.now()}`,
              issuedAt: new Date().toISOString(),
              paymentDetails: {
                id: payment.id,
                method: payment.method,
                amount: payment.amount,
                status: payment.status,
                transactionId: payment.transactionId
              },
              parcelDetails: {
                id: parcel.id,
                trackingCode: parcel.trackingCode,
                weight: parcel.weight,
                serviceType: parcel.serviceType,
                codAmount: parcel.codAmount,
                status: parcel.status
              },
              summary: {
                subTotal: payment.amount,
                tax: 0, // প্রোজেক্ট রিকোয়ারমেন্ট অনুযায়ী ট্যাক্স ০ রাখা হয়েছে
                totalPayable: payment.amount
              }
            };
            return of(invoice);
          })
        );
      })
    );
  }
}