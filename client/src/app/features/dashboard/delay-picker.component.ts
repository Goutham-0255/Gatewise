import { Component, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export const MAX_DELAY_MS = 5000;
export const DELAY_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-delay-picker',
  standalone: true,
  template: `
    <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <label for="delay-picker" class="text-sm font-medium text-gray-700">Simulated API delay</label>
        <span class="font-mono text-sm text-indigo-600" aria-live="polite">
          {{ value === 0 ? 'Off' : value + ' ms' }}
        </span>
      </div>
      <input
        id="delay-picker"
        type="range"
        min="0"
        [max]="max"
        step="250"
        [value]="value"
        (input)="onInput($event)"
        aria-describedby="delay-help"
        class="mt-3 w-full cursor-pointer accent-indigo-600"
      />
      <p id="delay-help" class="mt-2 text-xs text-gray-500">
        Adds an artificial wait on the server before it answers (capped at {{ max }} ms), so you can watch the
        loading states.
      </p>
    </div>
  `,
})
export class DelayPickerComponent {
  @Input() value = 0;
  /** Emits after the slider settles, so dragging does not fire a request per step. */
  @Output() delayChange = new EventEmitter<number>();

  readonly max = MAX_DELAY_MS;
  private readonly input$ = new Subject<number>();

  constructor() {
    this.input$
      .pipe(debounceTime(DELAY_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((ms) => this.delayChange.emit(ms));
  }

  onInput(event: Event): void {
    this.value = Number((event.target as HTMLInputElement).value);
    this.input$.next(this.value);
  }
}
