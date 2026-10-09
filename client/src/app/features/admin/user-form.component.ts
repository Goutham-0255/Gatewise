import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Role } from '../../core/services/auth.service';
import { User, UpdateUserPayload } from '../../core/models/user.model';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';

type Field = 'username' | 'email' | 'password' | 'role';

/** Create/edit dialog. `user` null means create. Emits the saved user. */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50 p-4" (click)="close()">
      <div
        class="max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        (click)="$event.stopPropagation()"
      >
        <h2 id="user-form-title" class="text-lg font-semibold text-gray-900">
          {{ user ? 'Edit user' : 'Add user' }}
        </h2>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-5 space-y-4" novalidate>
          <div>
            <label for="uf-username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              #firstField
              id="uf-username"
              type="text"
              formControlName="username"
              autocomplete="off"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [attr.aria-invalid]="!!fieldError('username')"
            />
            @if (fieldError('username'); as msg) {
              <p class="mt-1 text-sm text-red-600">{{ msg }}</p>
            }
          </div>

          <div>
            <label for="uf-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="uf-email"
              type="email"
              formControlName="email"
              autocomplete="off"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [attr.aria-invalid]="!!fieldError('email')"
            />
            @if (fieldError('email'); as msg) {
              <p class="mt-1 text-sm text-red-600">{{ msg }}</p>
            }
          </div>

          <div>
            <label for="uf-password" class="block text-sm font-medium text-gray-700">
              Password
              @if (user) {
                <span class="font-normal text-gray-400">(leave blank to keep the current one)</span>
              }
            </label>
            <input
              id="uf-password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [attr.aria-invalid]="!!fieldError('password')"
            />
            @if (fieldError('password'); as msg) {
              <p class="mt-1 text-sm text-red-600">{{ msg }}</p>
            }
          </div>

          <div>
            <label for="uf-role" class="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="uf-role"
              formControlName="role"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="General User">General User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          @if (serverError) {
            <div role="alert" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ serverError }}
            </div>
          }

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="close()"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="saving"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ saving ? 'Saving...' : user ? 'Save changes' : 'Create user' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class UserFormComponent implements OnInit, AfterViewInit {
  @Input() user: User | null = null;
  @Output() saved = new EventEmitter<User>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('firstField') private firstField?: ElementRef<HTMLInputElement>;

  private readonly users = inject(UserService);
  private readonly toast = inject(ToastService);

  readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    role: ['General User' as Role, Validators.required],
  });

  saving = false;
  serverError = '';
  private usernameTaken = false;

  ngOnInit(): void {
    if (this.user) {
      const { username, email, role } = this.user;
      this.form.patchValue({ username, email, role });
    } else {
      this.form.controls.password.addValidators(Validators.required);
    }
    this.form.controls.username.valueChanges.subscribe(() => (this.usernameTaken = false));
  }

  ngAfterViewInit(): void {
    this.firstField?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (!this.saving) this.closed.emit();
  }

  fieldError(field: Field): string | null {
    if (field === 'username' && this.usernameTaken) return 'Username already exists';
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) return null;
    const errors = control.errors;
    if (errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    if (errors['email']) return 'Enter a valid email address';
    if (errors['minlength']) return `Must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Must be at most ${errors['maxlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.serverError = '';
    const { password, ...rest } = this.form.getRawValue();
    const payload = { ...rest, username: rest.username.trim() };

    const request$: Observable<User> = this.user
      ? this.users.updateUser(this.user.id, (password ? { ...payload, password } : payload) as UpdateUserPayload)
      : this.users.createUser({ ...payload, password });

    request$.subscribe({
      next: (user) => {
        this.toast.success(this.user ? 'User updated' : 'User created');
        this.saved.emit(user);
      },
      error: (err: unknown) => {
        this.saving = false;
        this.handleError(err);
      },
    });
  }

  private handleError(err: unknown): void {
    const status = err instanceof HttpErrorResponse ? err.status : 0;
    const message = err instanceof HttpErrorResponse ? (err.error?.message as string | undefined) : undefined;
    if (status === 409) {
      this.usernameTaken = true;
      this.form.controls.username.markAsTouched();
    } else if (status === 400 && message) {
      this.serverError = message;
    } else if (status !== 401) {
      // 401 is handled by the interceptor (logout + redirect)
      this.toast.error('Something went wrong, please try again');
    }
  }
}
