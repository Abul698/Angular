export type UserRole = 'admin' | 'manager' | 'rider' | 'customer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  status: UserStatus;
  avatar: string;
  address?: string;
  zone?: string;
  vehicle?: string;
  nid?: string;
  totalDeliveries?: number;
  rating?: number;
  earnings?: number;
  createdAt: string;
  token?: string;
}