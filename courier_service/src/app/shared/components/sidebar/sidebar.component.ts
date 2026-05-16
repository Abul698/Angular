import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  title: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // আপনার প্রোজেক্টের Auth অবস্থা অনুযায়ী এই রোলটি চেঞ্জ হবে (admin / rider / customer)
  userRole: string = 'admin'; 

  // রোল ভিত্তিক মেনু লিস্ট
  menuConfig: Record<string, MenuItem[]> = {
    admin: [
      { title: 'Dashboard', route: '/admin/admin-dashboard', icon: 'bi-grid-1x2-fill' },
      { title: 'Manage Users', route: '/admin/manage-users', icon: 'bi-people-fill' },
      { title: 'Manage Riders', route: '/admin/manage-riders', icon: 'bi-bicycle' },
      { title: 'Manage Parcels', route: '/admin/manage-parcels', icon: 'bi-box-seam-fill' },
      { title: 'Revenue Reports', route: '/admin/revenue-reports', icon: 'bi-graph-up-arrow' }
    ],
    rider: [
      { title: 'Dashboard', route: '/rider/rider-dashboard', icon: 'bi-grid-1x2-fill' },
      { title: 'Assigned Deliveries', route: '/rider/assigned-deliveries', icon: 'bi-card-list' },
      { title: 'Earnings', route: '/rider/earnings', icon: 'bi-wallet2' }
    ],
    customer: [
      { title: 'Dashboard', route: '/customer/customer-dashboard', icon: 'bi-grid-1x2-fill' },
      { title: 'Send Parcel', route: '/customer/create-parcel', icon: 'bi-plus-circle-fill' },
      { title: 'Parcel History', route: '/customer/parcel-history', icon: 'bi-clock-history' },
      { title: 'Track Parcel', route: '/customer/track-parcel', icon: 'bi-geo-alt-fill' }
    ]
  };

  get menuItems(): MenuItem[] {
    return this.menuConfig[this.userRole] || [];
  }
}