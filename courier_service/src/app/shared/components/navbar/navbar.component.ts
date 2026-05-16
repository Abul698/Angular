import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  // ডেমো হিসেবে ট্রু রাখা হলো, আপনার auth.service এর সাথে পরে কানেক্ট করবেন
  isLoggedIn: boolean = true; 
  userName: string = 'John Doe';
  userRole: string = 'admin'; // admin, rider, customer

  constructor(private router: Router) {}

  logout() {
    this.isLoggedIn = false;
    this.router.navigate(['/home']);
  }
}