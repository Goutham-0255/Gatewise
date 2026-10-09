import { Observable, catchError, defer, map, of, startWith, switchMap } from 'rxjs';
import { RecordItem } from '../../core/models/record.model';

export type RecordsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; records: RecordItem[]; elapsedMs: number };

/**
 * Turns a stream of delay values into records states. switchMap cancels the previous request,
 * so a slow older response can never overwrite a newer one.
 */
export function createRecordsStream(
  delay$: Observable<number>,
  fetch: (delay: number) => Observable<RecordItem[]>,
  now: () => number = () => performance.now(),
): Observable<RecordsState> {
  return delay$.pipe(
    switchMap((delay) =>
      defer(() => {
        const start = now();
        return fetch(delay).pipe(
          map((records): RecordsState => ({ status: 'ready', records, elapsedMs: Math.round(now() - start) })),
        );
      }).pipe(
        catchError(() => of<RecordsState>({ status: 'error' })),
        startWith<RecordsState>({ status: 'loading' }),
      ),
    ),
  );
}
