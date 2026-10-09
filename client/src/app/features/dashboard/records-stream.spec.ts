import { Subject, throwError } from 'rxjs';
import { RecordItem } from '../../core/models/record.model';
import { RecordsState, createRecordsStream } from './records-stream';

const record = (id: string): RecordItem => ({
  id,
  userId: 'u1',
  title: id,
  description: '',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
});

describe('createRecordsStream', () => {
  it('lets the latest delay win even if an older response arrives later', () => {
    const delay$ = new Subject<number>();
    const responses = new Map<number, Subject<RecordItem[]>>();
    const fetch = (delay: number) => {
      const response = new Subject<RecordItem[]>();
      responses.set(delay, response);
      return response;
    };
    const states: RecordsState[] = [];
    createRecordsStream(delay$, fetch, () => 0).subscribe((s) => states.push(s));

    delay$.next(3000);
    delay$.next(500);
    // The newer request answers first, then the stale one tries to answer
    responses.get(500)!.next([record('new')]);
    responses.get(3000)!.next([record('stale')]);

    const ready = states.filter((s) => s.status === 'ready');
    expect(ready.length).toBe(1);
    expect(ready[0].status === 'ready' && ready[0].records[0].id).toBe('new');
    expect(responses.get(3000)!.observed).toBeFalse();
  });

  it('emits loading then error when the request fails', () => {
    const delay$ = new Subject<number>();
    const states: RecordsState[] = [];
    createRecordsStream(delay$, () => throwError(() => new Error('down'))).subscribe((s) => states.push(s));
    delay$.next(0);
    expect(states.map((s) => s.status)).toEqual(['loading', 'error']);
  });

  it('reports the elapsed time of the request', () => {
    const delay$ = new Subject<number>();
    const response = new Subject<RecordItem[]>();
    let clock = 1000;
    const states: RecordsState[] = [];
    createRecordsStream(delay$, () => response, () => clock).subscribe((s) => states.push(s));
    delay$.next(1500);
    clock = 2523;
    response.next([]);
    const last = states[states.length - 1];
    expect(last.status === 'ready' && last.elapsedMs).toBe(1523);
  });
});
