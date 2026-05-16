export type ParcelStatus = 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'returned';
export type ServiceType = 'standard' | 'express' | 'overnight' | 'same-day';
export type ParcelType = 'document' | 'product' | 'fragile' | 'heavy' | 'perishable';
export type PaymentMethod = 'cod' | 'prepaid' | 'bkash' | 'nagad' | 'sslcommerz';

export interface ParcelHistory {
  date: string;
  status: string;
  note: string;
  location: string;
}

//   customerId: number;
//   riderId: number | null;
//   senderName: string;
//   senderPhone: string;
//   senderAddress: string;
//   receiverName: string;
//   receiverPhone: string;
//   receiverAddress: string;
//   parcelType: ParcelType;
//   weight: number;
//   description: string;
//   serviceType: ServiceType;
//   deliveryCharge: number;
//   codAmount: number;
//   paymentMethod: PaymentMethod;
//   paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
//   status: ParcelStatus;
//   priority: 'normal' | 'high' | 'urgent';
//   estimatedDelivery: string;
//     createdAt: string;
//   updatedAt: string;
//   history: ParcelHistory[];
// }

// src/app/core/models/parcel.model.ts
export interface Parcel {
  id?: string;
  trackingCode: string;
  customerId: string;riderId: number | null;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  pickupZone: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryZone: string;
  parcelType: 'document' | 'product' | 'fragile' | 'heavy' | 'perishable';
  weight: number;
  description?: string;
  serviceType: 'standard' | 'express' | 'overnight' | 'same-day';
  codAmount: number;
  paymentMethod: 'COD' | 'bKash' | 'Nagad' | 'SSLCommerz' | 'Prepaid';
  paymentStatus: 'pending' | 'paid';
  priority: 'normal' | 'high' | 'urgent';
  specialInstructions?: string;
  deliveryCharge: number;
  codSurcharge: number;
  totalAmount: number;
  status: 'pending' | 'booked' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  timeline: { status: string; note: string; location: string; date: string }[];
  cancellationReason?: string;}
 

  export interface RiderInfo {
  name: string;
  phone: string;
  avatar?: string;
}

export interface PublicParcelTrack {
  id: string;
  trackingCode: string;
  senderAddress: string;
  receiverAddress: string;
  status: 'booked' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  cancellationReason?: string;
  rider?: RiderInfo;
  timeline: TrackingTimeline[];
}
