// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-home',
//   imports: [],
//   templateUrl: './home.html',
//   styleUrl: './home.css',
// })
// export class Home {}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BdtCurrencyPipe } from '../shared/pipes/bdt-currency.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BdtCurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  trackingId: string = '';

  // Services Data
  services = [
    { name: 'Standard Delivery', price: 60, desc: 'Delivery within 2-3 business days across Bangladesh.', icon: 'bi-box-seam' },
    { name: 'Express Delivery', price: 100, desc: 'Next-day delivery guaranteed within major divisions.', icon: 'bi-lightning-charge' },
    { name: 'Overnight Shipping', price: 150, desc: 'Urgent night transit for morning deliveries.', icon: 'bi-moon-stars' },
    { name: 'Same-Day Delivery', price: 200, desc: 'Instant local pickup and delivery within 6 hours.', icon: 'bi-speedometer2' }
  ];

  // How It Works Data
  steps = [
    { title: 'Book Parcel', desc: 'Fill details online or via app', icon: 'bi-file-earmark-plus' },
    { title: 'Rider Pickup', desc: 'Rider collects from doorstep', icon: 'bi-bicycle' },
    { title: 'In Transit', desc: 'Fastest logistics processing', icon: 'bi-truck' },
    { title: 'Delivered', desc: 'Safe delivery with OTP check', icon: 'bi-check-circle-fill' }
  ];

  onTrackSubmit() {
    if (this.trackingId.trim()) {
      alert(`Tracking Parcel: ${this.trackingId}`);
      // ভবিষ্যতে এখানে track page-এ নেভিগেট করার লজিক লিখতে পারেন
    }
  }
}