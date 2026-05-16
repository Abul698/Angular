import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ToastMessage {
  id: number;
  type: 'success' | 'danger' | 'info';
  text: string;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  // ডেমো নোটিফিকেশন ডাটা
  toasts: ToastMessage[] = [
    { id: 1, type: 'success', text: 'Parcel successfully booked!' },
    { id: 2, type: 'danger', text: 'Payment transaction failed.' }
  ];

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}