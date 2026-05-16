import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  // ডেমো হিসেবে ট্রু রাখা হয়েছে, পরে এটাকে loading.service এর রিলেটেড সাবস্ক্রিপশনে নিবেন
  isLoading: boolean = true; 
}