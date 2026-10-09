import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 class="text-3xl font-semibold text-gray-900">Admin</h1>
      @if (auth.currentUser$ | async; as user) {
        <p class="text-gray-600">
          Signed in as <span class="font-medium">{{ user.username }}</span> ({{ user.role }})
        </p>
      }
      <button
        type="button"
        (click)="logout()"
        class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Logout
      </button>
    </main>
  `,
})
export class AdminComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
