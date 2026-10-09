import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map, of, switchMap, timer } from 'rxjs';

/** Requests faster than this never show the progress bar, which avoids a flicker on quick calls. */
export const LOADING_SHOW_DELAY_MS = 100;

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly count$ = new BehaviorSubject(0);

  /** True while at least one API request has been in flight for LOADING_SHOW_DELAY_MS. */
  readonly isLoading$: Observable<boolean> = this.count$.pipe(
    map((count) => count > 0),
    distinctUntilChanged(),
    switchMap((busy) => (busy ? timer(LOADING_SHOW_DELAY_MS).pipe(map(() => true)) : of(false))),
    distinctUntilChanged(),
  );

  get pending(): number {
    return this.count$.value;
  }

  increment(): void {
    this.count$.next(this.count$.value + 1);
  }

  decrement(): void {
    this.count$.next(Math.max(0, this.count$.value - 1));
  }
}
