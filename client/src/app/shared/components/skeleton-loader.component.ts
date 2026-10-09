import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="space-y-3" role="status" aria-label="Loading">
      @for (row of rowList; track $index) {
        <div class="h-10 animate-pulse rounded-lg bg-gray-200"></div>
      }
      <span class="sr-only">Loading...</span>
    </div>
  `,
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;

  get rowList(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
