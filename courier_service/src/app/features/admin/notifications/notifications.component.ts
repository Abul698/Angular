
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export interface SystemNotification {
  id: string;
  userId: string;
  trackingCode: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/notifications';

  // Fallback / Mock User Id session setup. Replace with your actual AuthService context
  currentUserId = 'c101'; 
  
  notifications: SystemNotification[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    // Fetch notifications matching the target user context
    this.http.get<SystemNotification[]>(`${this.apiUrl}?userId=${this.currentUserId}&_sort=createdAt&_order=desc`)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => this.notifications = data,
        error: (err) => console.error('Failed to resolve system notifications pool', err)
      });
  }

  markAsRead(notification: SystemNotification): void {
    if (notification.isRead) return;

    this.http.patch<SystemNotification>(`${this.apiUrl}/${notification.id}`, { isRead: true })
      .subscribe({
        next: () => notification.isRead = true,
        error: (err) => console.error('Failed to commit operational read state', err)
      });
  }

  markAllAsRead(): void {
    const unreadList = this.notifications.filter(n => !n.isRead);
    if (unreadList.length === 0) return;

    this.isLoading = true;
    const batchRequests: Observable<any>[] = unreadList.map(n => 
      this.http.patch(`${this.apiUrl}/${n.id}`, { isRead: true })
    );

    forkJoin(batchRequests).pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.notifications.forEach(n => n.isRead = true);
        },
        error: (err) => console.error('Batch read operation execution failed', err)
      });
  }

  deleteNotification(id: string, event: Event): void {
    // Intercept event streaming to prevent target background click fires
    event.stopPropagation();

    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
        },
        error: (err) => console.error('Failed to execute server-side deletion task', err)
      });
  }
}