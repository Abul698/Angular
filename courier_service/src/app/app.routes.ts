import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { customerGuard } from './core/guards/customer.gurd';
import { authGuard } from './core/guards/auth.gurd';
import { riderGuard } from './core/guards/rider.gurd';
import { adminGuard } from './core/guards/admin';
import { OtpVerifyComponent } from './features/auth/otp-verify/otp-verify.component';
import { CustomerDashboardComponent } from './features/customer/customer-dashboard/customer-dashboard.component';
import { CreateParcelComponent } from './features/customer/create-parcel/create-parcel.component';
import { ParcelHistoryComponent } from './features/customer/parcel-history/parcel-history.component';
import { TrackParcelComponent } from './features/customer/track-parcel/track-parcel.component';
import { PaymentComponent } from './features/customer/payment/payment.component';
import { RiderDashboardComponent } from './features/rider/rider-dashboard/rider-dashboard.component';
import { AssignedDeliveriesComponent } from './features/rider/assigned-deliveries/assigned-deliveries.component';
import { UpdateStatusComponent } from './features/rider/update-status/update-status.component';
import { EarningsComponent } from './features/rider/earnings/earnings.component';
import { PendingPickupsComponent } from './features/rider/pending-pickups/pending-pickups.component';

// //Guards (Core ফোল্ডার থেকে)
// import { adminGuard } from './core/guards/admin.guard';
// import { authGuard } from './core/guards/auth.guard';
// import { customerGuard } from './core/guards/customer.guard';
// import { riderGuard } from './core/guards/rider.guard';

// // Features -> Public/Auth Components
// import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
// import { LoginComponent } from './features/auth/login/login.component';
// import { OtpVerifyComponent } from './features/auth/otp-verify/otp-verify.component';
//  import { RegisterComponent } from './features/auth/register/register.component';

// // Features -> Customer Components
// import { CancelOrderComponent } from './features/customer/cancel-order/cancel-order.component';
// import { CreateParcelComponent } from './features/customer/create-parcel/create-parcel.component';
//  import { CustomerDashboardComponent } from './features/customer/customer-dashboard/customer-dashboard.component';
// import { ParcelHistoryComponent } from './features/customer/parcel-history/parcel-history.component';
// import { PaymentComponent } from './features/customer/payment/payment.component';
// import { TrackParcelComponent } from './features/customer/track-parcel/track-parcel.component';

// // Features -> Rider Components
// import { AssignedDeliveriesComponent } from './features/rider/assigned-deliveries/assigned-deliveries.component';
// import { EarningsComponent } from './features/rider/earnings/earnings.component';
// import { RiderDashboardComponent } from './features/rider/rider-dashboard/rider-dashboard.component';
// import { UpdateStatusComponent } from './features/rider/update-status/update-status.component';

// // Features -> Admin Components
// import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
// import { AnalyticsComponent } from './features/admin/analytics/analytics.component';
// import { ManageParcelsComponent } from './features/admin/manage-parcels/manage-parcels.component';
// import { ManageRidersComponent } from './features/admin/manage-riders/manage-riders.component';
// import { ManageUsersComponent } from './features/admin/manage-users/manage-users.component';
// import { NotificationsComponent as AdminNotifications } from './features/admin/notifications/notifications.component';
// import { RevenueReportsComponent } from './features/admin/revenue-reports/revenue-reports.component';
// import { authGuard } from './core/guards/auth.gurd';
// import { customerGuard } from './core/guards/customer.gurd';
// import { riderGuard } from './core/guards/rider.gurd';

export const routes: Routes = [
  // --- Public / Authentication Routes ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'otp-verify', component: OtpVerifyComponent },

  // --- Customer Panel (Protected with Parent Layout & Child Routes) ---
  {
    path: 'customer',
    component: CustomerDashboardComponent,
    canActivate: [authGuard, customerGuard],
    children: [
      { path: 'dashboard', redirectTo: 'history', pathMatch: 'full' }, // ডিফল্ট ল্যান্ডিং
      { path: 'create-parcel', component: CreateParcelComponent },
      { path: 'history', component: ParcelHistoryComponent },
      { path: 'track', component: TrackParcelComponent },
      { path: 'payment/:parcelId', component: PaymentComponent },
      { path: 'cancel-order', component: CancelOrderComponent }
    ]
  },

  // --- Rider Panel (Protected with Parent Layout & Child Routes) ---
  {
    path: 'rider',
    component: RiderDashboardComponent,
    canActivate: [authGuard, riderGuard],
    children: [
      { path: 'dashboard', redirectTo: 'assigned-deliveries', pathMatch: 'full' },
      { path: 'assigned-deliveries', component: AssignedDeliveriesComponent },
      { path: 'update-status', component: UpdateStatusComponent },
      { path: 'earnings', component: EarningsComponent }
    ]
  },



  // --- Admin Panel (Protected with Parent Layout & Child Routes) ---
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', redirectTo: 'analytics', pathMatch: 'full' },
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'manage-riders', component: ManageRidersComponent },
      { path: 'manage-parcels', component: ManageParcelsComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'revenue-reports', component: RevenueReportsComponent },
      { path: 'notifications', component: AdminNotification }
    ]
  },

  // --- Wildcard Route for 404 Handling ---
  { path: '**', redirectTo: 'login' },
  {path: 'track',
    loadComponent: () => import('./features/customer/track-parcel/track-parcel.component').then(m => m.TrackParcelComponent)
  },
  {path: 'track/:code',
    loadComponent: () => import('./features/customer/track-parcel/track-parcel.component').then(m => m.TrackParcelComponent)
  },
  {path: 'update-status/:id',
  loadComponent: () => import('./features/rider/update-status/update-status.component').then(m => m.UpdateStatusComponent)
}
];



export const RIDER_ROUTES: Routes = [
  { path: 'dashboard', component: RiderDashboardComponent },
  { path: 'deliveries', component: AssignedDeliveriesComponent },
  { path: 'update-status/:id', component: UpdateStatusComponent }, // :id প্যারামিটার সহ রাউট ম্যাপিং
  { path: 'pending', component: PendingPickupsComponent },
  { path: 'earnings', component: EarningsComponent }
];


import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageRidersComponent } from './manage-riders/manage-riders.component';
import { ManageParcelsComponent } from './manage-parcels/manage-parcels.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { RevenueReportsComponent } from './revenue-reports/revenue-reports.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'users', component: ManageUsersComponent },
  { path: 'riders', component: ManageRidersComponent },
  { path: 'parcels', component: ManageParcelsComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'revenue', component: RevenueReportsComponent }
];

import { Routes } from '@angular/router';

export const Routes: Routes = [
  // ১. রুট পাথে আসলে সরাসরি /home এ পাঠিয়ে দেবে
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ২. পাবলিক হোম পেজ রাউট যুক্ত করা হলো
  { 
    path: 'home', 
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) 
  },

  // আপনার বাকি ফিচার রাউটগুলো নিচে যেভাবে আছে সেভাবেই থাকবে...
];