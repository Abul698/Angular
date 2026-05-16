import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rider-earnings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-2xl font-black text-white">Earnings & Balance Statements</h1>
        <button (click)="exportLedgerCSV()" class="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-200 px-4 py-2.5 rounded-xl transition-all">
          Download Ledger Statement (CSV)
        </button>
      </div>

      <!-- METRIC ACCOUNT CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold">Total Disbursed</span>
          <p class="text-xl font-black text-white mt-1">৳ ৪৫,৮০০</p>
        </div>
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold">This Month Cycle</span>
          <p class="text-xl font-black text-amber-500 mt-1">৳ ১৪,৫০০</p>
        </div>
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold">Pending Payout Allocation</span>
          <p class="text-xl font-black text-indigo-400 mt-1">৳ ৩,৪২০</p>
        </div>
        <div class="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <span class="text-xs text-slate-400 uppercase font-bold">Avg Per Manifest Drop</span>
          <p class="text-xl font-black text-emerald-400 mt-1">৳ ৬০</p>
        </div>
      </div>

      <!-- TRANSACTION LEDGER LOG TABLE -->
      <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-6 border-b border-slate-800">
          <h3 class="text-base font-black text-white">Historical Remittance Log</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th class="p-4">Settlement Date</th>
                <th class="p-4">Reference Context Code</th>
                <th class="p-4">Remittance Type</th>
                <th class="p-4">Amount Credited</th>
                <th class="p-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-900 font-medium text-slate-300">
              <tr *ngFor="let item of ledger" class="hover:bg-slate-900/50 transition-colors">
                <td class="p-4 whitespace-nowrap">{{ item.date }}</td>
                <td class="p-4 font-mono font-bold text-amber-500">{{ item.code }}</td>
                <td class="p-4">{{ item.type }}</td>
                <td class="p-4 font-bold text-white">৳ {{ item.amount }}</td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    [ngClass]="item.status === 'credited' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EarningsComponent {
  // Mock ledger matrix matching the data structure profile
  ledger = [
    { date: '2026-05-15', code: 'LGF-78342-BD', type: 'Delivery Commission', amount: 60, status: 'credited' },
    { date: '2026-05-15', code: 'LGF-92114-BD', type: 'Delivery Commission', amount: 60, status: 'credited' },
    { date: '2026-05-14', code: 'LGF-33491-BD', type: 'Fuel Allowance Bonus', amount: 200, status: 'credited' },
    { date: '2026-05-13', code: 'LGF-10493-BD', type: 'Delivery Commission', amount: 60, status: 'pending' }
  ];

  exportLedgerCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Code,Type,Amount,Status\n";
    this.ledger.forEach(row => {
      csvContent += `${row.date},${row.code},${row.type},${row.amount},${row.status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rider_Earnings_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}