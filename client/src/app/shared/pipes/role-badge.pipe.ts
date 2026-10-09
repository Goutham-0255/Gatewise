import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '../../core/services/auth.service';

const BASE = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

/** Maps a role to the Tailwind classes of its pill: Admin green, General User blue. */
@Pipe({ name: 'roleBadge', standalone: true })
export class RoleBadgePipe implements PipeTransform {
  transform(role: Role): string {
    return role === 'Admin'
      ? `${BASE} bg-green-100 text-green-800 ring-1 ring-inset ring-green-600/20`
      : `${BASE} bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-600/20`;
  }
}
