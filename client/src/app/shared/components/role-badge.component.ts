import { Component, Input } from '@angular/core';
import { Role } from '../../core/services/auth.service';
import { RoleBadgePipe } from '../pipes/role-badge.pipe';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [RoleBadgePipe],
  template: `<span [class]="role | roleBadge">{{ role }}</span>`,
})
export class RoleBadgeComponent {
  @Input({ required: true }) role!: Role;
}
