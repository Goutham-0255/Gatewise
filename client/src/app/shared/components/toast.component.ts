import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex animate-slide-in items-start gap-3 rounded-lg border p-3 text-sm shadow-lg"
          [class]="
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          "
          [attr.role]="toast.type === 'error' ? 'alert' : 'status'"
        >
          <p class="flex-1">{{ toast.message }}</p>
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="rounded p-0.5 opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
