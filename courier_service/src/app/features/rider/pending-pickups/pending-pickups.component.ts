import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pending-pickups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-black text-white">Zone Pipeline Pickups</h1>
        <p class="text-xs text-slate-400 mt-1">Available unassigned parcels matching your structural operational route profile.</p>
      </div>

      <div class="space-y-3">
        <div *ngFor="let item of pendingItems" class="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="space-y-1 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-amber-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{{ item.trackingCode }}</span>
              <span class="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">{{ item.serviceType }}</span>
            </div>
            <p class="text-sm font-bold text-slate-200 pt-1"><span class="text-slate-500 text-xs font-medium block">Pickup Point:</span> {{ item.senderAddress }}</p>
            <p class="text-xs text-slate-400">Payload Metadata: Weight: {{ item.weight }}KG | Created: {{ item.createdAt | date:'short' }}</p>
          </div>
          
          <button (click)="acceptTask(item.id)" class="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md">
            Accept & Commit Pickup
          </button>
        </div>

        <div *ngIf="pendingItems.length === 0" class="text-center py-12 bg-slate-950 border border-dashed border-slate-800 rounded-2xl">
          <p class="text-sm text-slate-500">No pending pickups flagged within your central routing parameters.</p>
        </div>
      </div>
    </div>
  `
})
export class PendingPickupsComponent implements OnInit {
  private http = inject(HttpClient);
  pendingItems: any[] = [];

  ngOnInit() { this.loadPendingPool(); }

  loadPendingPool() {
    this.http.get<any[]>('http://localhost:3000/parcels?status=pending').subscribe(res => this.pendingItems = res);
  }

  acceptTask(id: string) {
    const payload = { status: 'picked_up', assignedRiderId: 'rider-001' };
    this.http.patch(`http://localhost:3000/parcels/${id}`, payload).subscribe(() => this.loadPendingPool());
  }
}