import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assigned-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-black text-white">Assigned Operational Manifest</h1>

      <!-- RESPONSIVE CARDS CONTAINER -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let parcel of deliveries" class="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          
          <!-- TOP CARD MATRIX -->
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-amber-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{{ parcel.trackingCode }}</span>
                <span *ngIf="parcel.priority === 'urgent'" class="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-black uppercase">Urgent</span>
              </div>
              <p class="text-xs text-slate-400 mt-2"><span class="text-slate-500">Type:</span> {{ parcel.parcelType | uppercase }} | <span class="text-slate-500">Weight:</span> {{ parcel.weight }}KG</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {{ parcel.status.replace('_', ' ') }}
            </span>
          </div>

          <!-- ADDRESS ROUTING HUB -->
          <div class="text-xs space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <p class="text-slate-300 font-medium"><span class="text-emerald-500 font-bold mr-1">⇅ From:</span> {{ parcel.senderAddress }}</p>
            <p class="text-slate-300 font-medium"><span class="text-amber-500 font-bold mr-1">⇅ To:</span> {{ parcel.receiverAddress }}</p>
          </div>

          <!-- COD AND VALUE MANAGEMENT -->
          <div class="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
            <span class="text-xs font-bold text-slate-400">Cash on Delivery Required</span>
            <span class="text-sm font-black text-white">৳ {{ parcel.codAmount }}</span>
          </div>

          <!-- STATUS INTERACTIVE DRIVERS -->
          <div class="flex flex-col sm:flex-row gap-2 pt-2">
            <button *ngIf="parcel.status === 'picked_up'" (click)="updateStatus(parcel.id, 'in_transit')" class="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md">
              Mark In Transit
            </button>
            <button *ngIf="parcel.status === 'in_transit'" (click)="updateStatus(parcel.id, 'out_for_delivery')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md">
              Mark Out for Delivery
            </button>
            <button *ngIf="parcel.status === 'out_for_delivery'" (click)="openProofModal(parcel.id)" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md">
              Complete Delivery
            </button>
            <button (click)="openIssueModal(parcel.id)" class="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-rose-400 py-2.5 px-4 rounded-xl transition-all">
              Report Issue
            </button>
          </div>
        </div>
      </div>

      <!-- PROOF/COMPLETION MODAL LAYER -->
      <div *ngIf="activeProofId" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-slate-950 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
          <h3 class="text-base font-black text-white">Close Delivery Manifest</h3>
          <div>
            <label class="text-xs font-bold text-slate-400 uppercase block mb-1">Internal Handover Note</label>
            <textarea [(ngModel)]="deliveryNote" rows="3" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500" placeholder="e.g., Handed over to recipient's security guard..."></textarea>
          </div>
          <div class="flex gap-2">
            <button (click)="submitDeliveryComplete()" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl">Confirm Delivery</button>
            <button (click)="activeProofId = null" class="px-4 py-2.5 bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 rounded-xl">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssignedDeliveriesComponent implements OnInit {
  private http = inject(HttpClient);
  deliveries: any[] = [];
  activeProofId: string | null = null;
  deliveryNote: string = '';

  ngOnInit() { this.loadManifest(); }

  loadManifest() {
    this.http.get<any[]>('http://localhost:3000/parcels?status_ne=delivered&status_ne=cancelled')
      .subscribe(res => this.deliveries = res);
  }

  updateStatus(id: string, nextStatus: string, note: string = '') {
    const payload = { status: nextStatus, lastUpdated: new Date().toISOString() };
    this.http.patch(`http://localhost:3000/parcels/${id}`, payload).subscribe(() => this.loadManifest());
  }

  openProofModal(id: string) { this.activeProofId = id; this.deliveryNote = ''; }

  submitDeliveryComplete() {
    if (this.activeProofId) {
      this.updateStatus(this.activeProofId, 'delivered', this.deliveryNote);
      this.activeProofId = null;
    }
  }

  openIssueModal(id: string) {
    const reason = prompt("Enter operational issue (e.g., Customer Unavailable, Wrong Address):");
    if (reason) this.updateStatus(id, 'in_transit', `Issue Flagged: ${reason}`);
  }
}