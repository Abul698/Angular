import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-black text-white tracking-tight">Rider Dashboard Overview</h1>
        <span class="text-xs text-slate-400 font-semibold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">Shift Active</span>
      </div>

      <!-- STATS DISPLAY GRID -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">Today's Deliveries</span>
          <p class="text-2xl font-black text-white mt-1">05 / 08</p>
        </div>
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Earnings</span>
          <p class="text-2xl font-black text-amber-500 mt-1">৳ ১৪,৫০০</p>
        </div>
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">Zone Pickups Available</span>
          <p class="text-2xl font-black text-indigo-400 mt-1">12</p>
        </div>
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold tracking-wider">Performance Rating</span>
          <p class="text-2xl font-black text-emerald-400 mt-1">4.8 ★</p>
        </div>
      </div>

      <!-- TODAY'S RUNSHEET LIST -->
      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <h3 class="text-base font-black text-white mb-4">Today's Active Runsheet</h3>
        <div class="space-y-3">
          <div *ngFor="let run of todayParcels" class="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-xs font-mono font-bold text-amber-500">{{ run.trackingCode }}</span>
              <p class="text-sm font-bold text-slate-200 mt-0.5">{{ run.receiverName }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ run.receiverAddress }}</p>
            </div>
            <div class="text-right">
              <span class="text-xs px-2.5 py-1 rounded-full font-bold uppercase" 
                [ngClass]="run.status === 'out_for_delivery' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'">
                {{ run.status.replace('_', ' ') }}
              </span>
              <p class="text-xs font-bold text-slate-300 mt-1">COD: ৳{{ run.codAmount }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RiderDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  todayParcels: any[] = [];

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/parcels?status=out_for_delivery&_limit=3')
      .subscribe(data => this.todayParcels = data);
  }
}