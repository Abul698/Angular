import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html'
})
export class ManageUsersComponent implements OnInit {
  private http = inject(HttpClient);

  users: any[] = [];
  isLoading = false;
  
  // Filtering states
  searchQuery = '';
  selectedRole = 'all';
  selectedStatus = 'all';

  // Modal Context State Anchors
  activeModal: 'add' | 'edit' | 'details' | null = null;
  selectedUser: any = null;

  // Bound Form Data Structuring
  userForm = { name: '', email: '', phone: '', role: 'customer', status: 'active' };

  ngOnInit(): void { this.fetchUsersList(); }

  fetchUsersList(): void {
    this.isLoading = true;
    // JSON-Server querying composition setup
    let targetUrl = 'http://localhost:3000/users?';
    if (this.selectedRole !== 'all') targetUrl += `role=${this.selectedRole}&`;
    if (this.selectedStatus !== 'all') targetUrl += `status=${this.selectedStatus}&`;
    if (this.searchQuery) targetUrl += `q=${this.searchQuery}&`;

    this.http.get<any[]>(targetUrl).pipe(finalize(() => this.isLoading = false)).subscribe(res => this.users = res);
  }

  openAddModal(): void {
    this.activeModal = 'add';
    this.userForm = { name: '', email: '', phone: '', role: 'customer', status: 'active' };
  }

  submitAddUser(): void {
    const payload = { ...this.userForm, joined: new Date().toISOString().split('T')[0] };
    this.http.post('http://localhost:3000/users', payload).subscribe(() => {
      this.activeModal = null;
      this.fetchUsersList();
    });
  }

  openEditModal(user: any): void {
    this.activeModal = 'edit';
    this.selectedUser = user;
    this.userForm = { ...user };
  }

  submitEditUser(): void {
    this.http.patch(`http://localhost:3000/users/${this.selectedUser.id}`, this.userForm).subscribe(() => {
      this.activeModal = null;
      this.fetchUsersList();
    });
  }

  triggerDelete(id: string): void {
    if (confirm("Execute total deletion on user node asset context?")) {
      this.http.delete(`http://localhost:3000/users/${id}`).subscribe(() => this.fetchUsersList());
    }
  }

  openDetailsModal(user: any): void {
    this.activeModal = 'details';
    this.selectedUser = user;
  }
}