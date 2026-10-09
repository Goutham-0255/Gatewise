import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { RoleBadgeComponent } from '../../shared/components/role-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader.component';
import { PAGE_SIZE, paginate } from './pagination';
import { UserFormComponent } from './user-form.component';

type LoadStatus = 'loading' | 'error' | 'ready';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    DatePipe,
    ConfirmDialogComponent,
    RoleBadgeComponent,
    SkeletonLoaderComponent,
    UserFormComponent,
  ],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Users</h1>
        <p class="text-sm text-gray-500">Manage who can sign in and what they can do</p>
      </div>
      <button
        type="button"
        (click)="openCreate()"
        class="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600"
      >
        Add user
      </button>
    </div>

    @switch (status()) {
      @case ('loading') {
        <app-skeleton-loader [rows]="5" />
      }
      @case ('error') {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
          <p class="font-medium text-red-800">Could not load users.</p>
          <button
            type="button"
            (click)="load()"
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      }
      @case ('ready') {
        @if (users().length === 0) {
          <div class="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No users yet
          </div>
        } @else {
          <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" class="px-4 py-3">Username</th>
                  <th scope="col" class="px-4 py-3">Email</th>
                  <th scope="col" class="px-4 py-3">Role</th>
                  <th scope="col" class="px-4 py-3">Created</th>
                  <th scope="col" class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (user of view().items; track user.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{{ user.username }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
                    <td class="px-4 py-3"><app-role-badge [role]="user.role" /></td>
                    <td class="whitespace-nowrap px-4 py-3 text-gray-600">{{ user.createdAt | date: 'mediumDate' }}</td>
                    <td class="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        (click)="openEdit(user)"
                        class="rounded-md px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        (click)="askDelete(user)"
                        [disabled]="user.id === currentUserId()"
                        [attr.title]="user.id === currentUserId() ? 'You cannot delete your own account' : null"
                        class="ml-1 rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
            <span>{{ view().total }} {{ view().total === 1 ? 'user' : 'users' }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="page.set(view().page - 1)"
                [disabled]="view().page <= 1"
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span aria-live="polite">Page {{ view().page }} of {{ view().totalPages }}</span>
              <button
                type="button"
                (click)="page.set(view().page + 1)"
                [disabled]="view().page >= view().totalPages"
                class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        }
      }
    }

    @if (formOpen()) {
      <app-user-form [user]="editing()" (saved)="onSaved()" (closed)="formOpen.set(false)" />
    }

    @if (deleting(); as user) {
      <app-confirm-dialog
        title="Delete user?"
        [message]="'This permanently removes ' + user.username + '.'"
        [busy]="deleteBusy()"
        (confirmed)="confirmDelete(user)"
        (cancelled)="deleting.set(null)"
      />
    }
  `,
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly currentUser = toSignal(inject(AuthService).currentUser$);

  readonly users = signal<User[]>([]);
  readonly status = signal<LoadStatus>('loading');
  readonly page = signal(1);
  readonly view = computed(() => paginate(this.users(), this.page(), PAGE_SIZE));
  readonly currentUserId = computed(() => this.currentUser()?.id);

  readonly formOpen = signal(false);
  readonly editing = signal<User | null>(null);
  readonly deleting = signal<User | null>(null);
  readonly deleteBusy = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(user: User): void {
    this.editing.set(user);
    this.formOpen.set(true);
  }

  onSaved(): void {
    this.formOpen.set(false);
    this.load();
  }

  askDelete(user: User): void {
    this.deleting.set(user);
  }

  confirmDelete(user: User): void {
    this.deleteBusy.set(true);
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        // paginate() clamps the page, so keep the signal in step with what is shown
        this.page.set(this.view().page);
        this.toast.success('User deleted');
        this.closeDelete();
      },
      error: (err: unknown) => {
        const message = err instanceof HttpErrorResponse ? (err.error?.message as string | undefined) : undefined;
        this.toast.error(message ?? 'Something went wrong, please try again');
        this.closeDelete();
      },
    });
  }

  private closeDelete(): void {
    this.deleteBusy.set(false);
    this.deleting.set(null);
  }
}
