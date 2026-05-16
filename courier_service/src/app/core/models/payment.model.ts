export interface Payment {
  id?: number;
  parcelId: number;
  customerId: number;
  amount: number;
  method: string;
  gateway: string;
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}