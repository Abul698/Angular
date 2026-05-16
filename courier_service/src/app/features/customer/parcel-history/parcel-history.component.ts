import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ParcelService } from '../../../core/services/parcel.service';
import { AuthService } from '../../../core/services/auth.service';
// import { BdtCurrencyPipe } from '../../../shared/pipes/bdt-currency.pipe';
// import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

interface TimelineEvent {
  status: string;
  date: string;
  note: string;
  location: string;
}

interface Parcel {
  id: string;
  trackingCode: string;
  parcelType: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  serviceType: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  paymentMethod: string;
  weight: number;
  codAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  createdAt: string;
  timeline?: TimelineEvent[];
}

@Component({
  selector: 'app-parcel-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BdtCurrencyPipe, StatusBadgePipe],
  templateUrl: './parcel-history.component.html'
})
export class ParcelHistoryComponent implements OnInit {
  private parcelService = inject(ParcelService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Data Containers
  allParcels: Parcel[] = [];
  filteredParcels: Parcel[] = [];
  paginatedParcels: Parcel[] = [];
  selectedParcel: Parcel | null = null;

  // Filters State
  searchTerm: string = '';
  statusFilter: string = '';
  startDate: string = '';
  endDate: string = '';

  // Pagination State
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // UI Modals toggles
  showDetailsModal: boolean = false;
  showCancelConfirmModal: boolean = false;
  parcelToCancel: Parcel | null = null;

  ngOnInit(): void {
    this.loadParcelHistory();
  }

  loadParcelHistory(): void {
    const customerId = this.authService.getCurrentUser();
    this.parcelService.getByCustomer(customerId).subscribe({
      next: (data: Parcel[]) => {
        this.allParcels = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    this.filteredParcels = this.allParcels.filter(parcel => {
      const matchesSearch = parcel.trackingCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            parcel.receiverName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === '' || parcel.status === this.statusFilter;
      
      let matchesDate = true;
      if (this.startDate && this.endDate) {
        const pDate = new Date(parcel.createdAt).setHours(0,0,0,0);
        const sDate = new Date(this.startDate).setHours(0,0,0,0);
        const eDate = new Date(this.endDate).setHours(0,0,0,0);
        matchesDate = pDate >= sDate && pDate <= eDate;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredParcels.length / this.pageSize) || 1;
    const startIdx = (this.currentPage - 1) * this.pageSize;
    this.paginatedParcels = this.filteredParcels.slice(startIdx, startIdx + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  // Row Actions
  openDetails(parcel: Parcel): void {
    this.selectedParcel = parcel;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedParcel = null;
  }

  triggerCancel(parcel: Parcel): void {
    this.parcelToCancel = parcel;
    this.showCancelConfirmModal = true;
  }

  closeCancelModal(): void {
    this.showCancelConfirmModal = false;
    this.parcelToCancel = null;
  }

  confirmCancellation(): void {
    if (this.parcelToCancel) {
      this.parcelService.updateParcelStatus(this.parcelToCancel.id, 'cancelled').subscribe({
        next: () => {
          this.loadParcelHistory();
          this.closeCancelModal();
        }
      });
    }
  }

  payNow(parcelId: string): void {
    this.router.navigate([`/customer/payment/${parcelId}`]);
  }

  trackParcel(code: string): void {
    this.router.navigate([`/track/${code}`]);
  }

  // Export Filtered Dataset to CSV File
  exportToCSV(): void {
    const headers = ['Tracking Code', 'Type', 'Receiver Name', 'Service Type', 'Status', 'Payment Status', 'Total Price (BDT)', 'Booking Date'];
    const rows = this.filteredParcels.map(p => [
      p.trackingCode,
      p.parcelType,
      p.receiverName,
      p.serviceType,
      p.status,
      p.paymentStatus,
      p.totalAmount,
      p.createdAt
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `parcel_history_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}