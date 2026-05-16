import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-parcels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-parcels.component.html'
})
export class ManageParcelsComponent implements OnInit {
  private http = inject(HttpClient);

  parcels: any[] = [];
  selectedParcels: string[] = []; // Stores IDs for bulk structural mutations
  
  // Query Filters Configuration
  statusFilter = '';
  searchQuery = '';

  ngOnInit(): void { this.loadMasterParcelsGrid(); }

  loadMasterParcelsGrid(): void {
    let url = 'http://localhost:3000/parcels?';
    if (this.statusFilter) url += `status=${this.statusFilter}&`;
    if (this.searchQuery) url += `q=${this.searchQuery}&`;

    this.http.get<any[]>(url).subscribe(res => this.parcels = res);
  }

  toggleParcelSelection(id: string): void {
    const idx = this.selectedParcels.indexOf(id);
    if (idx > -1) this.selectedParcels.splice(idx, 1);
    else this.selectedParcels.push(id);
  }

  executeBulkStatusPatch(status: string): void {
    if (this.selectedParcels.length === 0 || !status) return;
    
    // Iterative chain execution array sequence pattern
    this.selectedParcels.forEach(id => {
      this.http.patch(`http://localhost:3000/parcels/${id}`, { status })
        .subscribe(() => {
          this.selectedParcels = [];
          this.loadMasterParcelsGrid();
        });
    });
  }

  triggerDeleteNode(id: string): void {
    if (confirm("Purge package registration element from tracking log index?")) {
      this.http.delete(`http://localhost:3000/parcels/${id}`).subscribe(() => this.loadMasterParcelsGrid());
    }
  }

  exportDataGridToCSV(): void {
    let rawCsv = "data:text/csv;charset=utf-8,TrackingCode,Receiver,Status,Amount\n";
    this.parcels.forEach(p => {
      rawCsv += `${p.trackingCode},${p.receiverName},${p.status},${p.totalAmount}\n`;
    });
    const uri = encodeURI(rawCsv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', uri);
    downloadAnchor.setAttribute('download', `System_Global_Manifest_Dump.csv`);
    downloadAnchor.click();
  }
}