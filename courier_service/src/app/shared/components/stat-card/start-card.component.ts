import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) subtitle!: string;
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) colorClass!: string;
  @Input({ required: true }) trend!: string;
  @Input({ required: true }) trendValue!: string;

  isTrendUp(): boolean {
    return this.trend ? this.trend.toLowerCase().includes('up') : false;
  }

  isTrendDown(): boolean {
    return this.trend ? this.trend.toLowerCase().includes('down') : false;
  }
}