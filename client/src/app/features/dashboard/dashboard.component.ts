import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <main class="flex min-h-screen items-center justify-center bg-gray-50">
      <h1 class="text-3xl font-semibold text-gray-900">Dashboard</h1>
    </main>
  `,
})
export class DashboardComponent {}
