import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, Observable, Subject, merge, map, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RecordsService } from '../../core/services/records.service';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { DelayPickerComponent } from './delay-picker.component';
import { RecordsState, createRecordsStream } from './records-stream';

@Component({
  selector: 'app-records-table',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DelayPickerComponent, SkeletonLoaderComponent],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Records</h1>
      <p class="text-sm text-gray-500">
        {{ (isAdmin$ | async) ? 'All records across every user' : 'Your records' }}
      </p>
    </div>

    <div class="mb-6 grid gap-3 md:grid-cols-[minmax(0,28rem)_auto] md:items-center">
      <app-delay-picker [value]="delay$.value" (delayChange)="delay$.next($event)" />
      <p class="text-sm text-gray-600" aria-live="polite">
        @switch (lastResponse()) {
          @case (null) {}
          @case ('failed') {
            <span class="text-red-600">Failed</span>
          }
          @default {
            API responded in <span class="font-mono font-medium text-gray-900">{{ lastResponse() }} ms</span>
          }
        }
      </p>
    </div>

    @if (state$ | async; as state) {
      @switch (state.status) {
        @case ('loading') {
          <app-skeleton-loader [rows]="4" />
        }
        @case ('error') {
          <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
            <p class="font-medium text-red-800">Could not load records.</p>
            <p class="mt-1 text-sm text-red-700">Check that the server is running, then try again.</p>
            <button
              type="button"
              (click)="reload()"
              class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        }
        @case ('ready') {
          @if (state.records.length === 0) {
            <div class="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
              No records yet
            </div>
          } @else {
            <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th scope="col" class="px-4 py-3">Title</th>
                    <th scope="col" class="px-4 py-3">Description</th>
                    <th scope="col" class="px-4 py-3">Status</th>
                    @if (isAdmin$ | async) {
                      <th scope="col" class="px-4 py-3">Owner</th>
                    }
                    <th scope="col" class="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (record of state.records; track record.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{{ record.title }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ record.description }}</td>
                      <td class="px-4 py-3">
                        <span
                          class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                          [class]="
                            record.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          "
                        >
                          {{ record.status }}
                        </span>
                      </td>
                      @if (isAdmin$ | async) {
                        <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ record.userId }}</td>
                      }
                      <td class="whitespace-nowrap px-4 py-3 text-gray-600">
                        {{ record.createdAt | date: 'mediumDate' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    }
  `,
})
export class RecordsTableComponent {
  private readonly records = inject(RecordsService);
  readonly isAdmin$ = inject(AuthService).isAdmin$;

  readonly delay$ = new BehaviorSubject(0);
  private readonly retry$ = new Subject<void>();

  /** Milliseconds of the latest successful request, 'failed' after an error, null before any result. */
  readonly lastResponse = signal<number | 'failed' | null>(null);

  readonly state$: Observable<RecordsState> = createRecordsStream(
    // A delay change or Retry both refetch with the current delay
    merge(this.delay$, this.retry$.pipe(map(() => this.delay$.value))),
    (delay) => this.records.getRecords(delay),
  ).pipe(
    tap((state) => {
      if (state.status === 'ready') this.lastResponse.set(state.elapsedMs);
      if (state.status === 'error') this.lastResponse.set('failed');
    }),
  );

  reload(): void {
    this.retry$.next();
  }
}
