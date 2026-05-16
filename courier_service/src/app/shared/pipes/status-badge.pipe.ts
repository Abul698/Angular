import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | undefined | null): string {
    if (!status) return 'badge bg-secondary';
    
    switch (status.toLowerCase().trim()) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'picked-up':
        return 'badge bg-info text-dark';
      case 'in-transit':
        return 'badge bg-primary';
      case 'out-for-delivery':
        return 'badge bg-purple';
      case 'delivered':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      case 'returned':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  }
}