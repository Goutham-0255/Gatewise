import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    @if (isLoading$ | async) {
      <div
        class="fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-indigo-100"
        role="progressbar"
        aria-label="Loading"
        aria-busy="true"
      >
        <div class="h-full w-1/3 animate-indeterminate bg-gradient-to-r from-indigo-500 to-violet-500"></div>
      </div>
    }
  `,
})
export class ProgressBarComponent {
  readonly isLoading$ = inject(LoadingService).isLoading$;
}
