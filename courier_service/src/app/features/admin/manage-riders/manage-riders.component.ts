import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-manage-riders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-riders.component.html'
})
export class ManageRidersComponent implements OnInit {
  private http = inject(HttpClient);
  
  riders: any[] = [];
  isLoading = false;
  showAddModal = false;

  // Form Model
  newRider = {
    name: '',
    phone: '',
    email: '',
    nid: '',
    vehicle: 'bike',
    zone: 'Dhaka Central',
    role: 'rider',
    status: 'active',
    rating: 5.0,
    totalDeliveries: 0,
    joinedDate: new Date().toISOString().split('T')[0]
  };

  ngOnInit(): void {
    this.loadRiders();
  }

  loadRiders(): void {
    this.isLoading = true;
    // JSON Server থেকে শুধুমাত্র রাইডারদের ফিল্টার করে আনুন
    this.http.get<any[]>('http://localhost:3000/users?role=rider')
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(data => this.riders = data);
  }

  toggleStatus(rider: any): void {
    const nextStatus = rider.status === 'active' ? 'suspended' : 'active';
    this.http.patch(`http://localhost:3000/users/${rider.id}`, { status: nextStatus })
      .subscribe(() => this.loadRiders());
  }

  submitRider(): void {
    this.http.post('http://localhost:3000/users', this.newRider)
      .subscribe(() => {
        this.showAddModal = false;
        this.loadRiders();
        // Reset Form
        this.newRider = { name: '', phone: '', email: '', nid: '', vehicle: 'bike', zone: 'Dhaka Central', role: 'rider', status: 'active', rating: 5.0, totalDeliveries: 0, joinedDate: new Date().toISOString().split('T')[0] };
      });
  }
}