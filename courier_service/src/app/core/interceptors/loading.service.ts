import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // BehaviorSubject যা লোডিং স্টেট (true/false) ট্র্যাক করবে
  private loading$ = new BehaviorSubject<boolean>(false);
  isLoading = this.loading$.asObservable();

  constructor() {}

  setLoading(isLoading: boolean): void {
    this.loading$.next(isLoading);
  }
}