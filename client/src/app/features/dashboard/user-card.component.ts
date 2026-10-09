import { Component, Input } from '@angular/core';
import { AuthUser } from '../../core/services/auth.service';
import { RoleBadgeComponent } from '../../shared/components/role-badge.component';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [RoleBadgeComponent],
  template: `
    <div class="flex items-center gap-3 rounded-xl bg-white/5 p-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold uppercase text-white"
        aria-hidden="true"
      >
        {{ user.username.charAt(0) }}
      </div>
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-white">{{ user.username }}</p>
        <p class="truncate text-xs text-slate-400">{{ user.email }}</p>
        <div class="mt-1"><app-role-badge [role]="user.role" /></div>
      </div>
    </div>
  `,
})
export class UserCardComponent {
  @Input({ required: true }) user!: AuthUser;
}
