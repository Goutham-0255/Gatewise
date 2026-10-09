import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserCardComponent } from './user-card.component';

/** Layout shared by /dashboard and /admin: sidebar navigation plus the routed page. */
@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet, UserCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 md:flex">
      <!-- Top bar on small screens -->
      <header class="flex items-center justify-between bg-[#1e293b] px-4 py-3 md:hidden">
        <span class="text-lg font-bold text-white">Gatewise</span>
        <button
          type="button"
          (click)="menuOpen.set(!menuOpen())"
          class="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="sidebar"
          aria-label="Toggle navigation"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      <aside
        id="sidebar"
        class="flex-col bg-[#1e293b] p-4 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0"
        [class.flex]="menuOpen()"
        [class.hidden]="!menuOpen()"
      >
        <span class="mb-8 hidden text-xl font-bold text-white md:block">Gatewise</span>

        <nav class="flex flex-1 flex-col gap-1" aria-label="Main">
          <a
            routerLink="/dashboard/records"
            routerLinkActive="!bg-gradient-to-r from-indigo-500 to-violet-500 !text-white"
            (click)="menuOpen.set(false)"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Records
          </a>
          @if (auth.isAdmin$ | async) {
            <a
              routerLink="/admin/users"
              routerLinkActive="!bg-gradient-to-r from-indigo-500 to-violet-500 !text-white"
              (click)="menuOpen.set(false)"
              class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Users
            </a>
          }
        </nav>

        <div class="mt-6 space-y-3 border-t border-white/10 pt-4">
          @if (auth.currentUser$ | async; as user) {
            <app-user-card [user]="user" />
          }
          <button
            type="button"
            (click)="logout()"
            class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      <main class="min-w-0 flex-1 p-4 md:p-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class DashboardShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
