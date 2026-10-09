import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50 p-4" (click)="cancel()">
      <div
        class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        (click)="$event.stopPropagation()"
      >
        <h2 id="confirm-title" class="text-lg font-semibold text-gray-900">{{ title }}</h2>
        <p id="confirm-message" class="mt-2 text-sm text-gray-600">{{ message }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <button
            #cancelButton
            type="button"
            (click)="cancel()"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmed.emit()"
            [disabled]="busy"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {{ busy ? 'Deleting...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent implements AfterViewInit {
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() confirmLabel = 'Delete';
  @Input() busy = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('cancelButton') private cancelButton?: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    // Focus the safe choice first
    this.cancelButton?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  cancel(): void {
    if (!this.busy) this.cancelled.emit();
  }
}
