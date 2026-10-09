import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LOADING_SHOW_DELAY_MS, LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;
  let states: boolean[];

  beforeEach(() => {
    service = TestBed.inject(LoadingService);
    states = [];
  });

  it('counts requests and never goes below zero', () => {
    service.increment();
    service.increment();
    service.decrement();
    expect(service.pending).toBe(1);
    service.decrement();
    service.decrement();
    expect(service.pending).toBe(0);
  });

  it('shows loading only after the delay and hides when the last request ends', fakeAsync(() => {
    const sub = service.isLoading$.subscribe((v) => states.push(v));
    service.increment();
    tick(LOADING_SHOW_DELAY_MS - 1);
    expect(states).toEqual([false]);
    tick(1);
    expect(states).toEqual([false, true]);
    service.decrement();
    expect(states).toEqual([false, true, false]);
    sub.unsubscribe();
  }));

  it('never shows loading for a request faster than the delay', fakeAsync(() => {
    const sub = service.isLoading$.subscribe((v) => states.push(v));
    service.increment();
    tick(LOADING_SHOW_DELAY_MS / 2);
    service.decrement();
    tick(LOADING_SHOW_DELAY_MS);
    expect(states).toEqual([false]);
    sub.unsubscribe();
  }));
});
