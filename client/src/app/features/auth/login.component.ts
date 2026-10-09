import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main
      class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 px-4"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h1 class="text-center text-3xl font-bold text-gray-900">Gatewise</h1>
        <p class="mt-1 text-center text-sm text-gray-500">Sign in to your account</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 space-y-5" novalidate>
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              autocomplete="username"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [attr.aria-invalid]="showError('username')"
              aria-describedby="username-error"
            />
            @if (showError('username')) {
              <p id="username-error" class="mt-1 text-sm text-red-600">Username is required</p>
            }
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              [attr.aria-invalid]="showError('password')"
              aria-describedby="password-error"
            />
            @if (showError('password')) {
              <p id="password-error" class="mt-1 text-sm text-red-600">Password is required</p>
            }
          </div>

          @if (error) {
            <div
              role="alert"
              class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {{ error }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loading"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            @if (loading) {
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              ></span>
              Signing in...
            } @else {
              Sign in
            }
          </button>
        </form>

        <div class="mt-6 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <p class="font-medium text-gray-700">Demo accounts</p>
          <p>admin / password123 (Admin)</p>
          <p>john_doe / password123 (General User)</p>
        </div>
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // No role selector: the server takes the role from the stored user, never from the request
  readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  showError(field: 'username' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: unknown) => {
        this.loading = false;
        this.error =
          err instanceof HttpErrorResponse && err.status === 401
            ? 'Invalid username or password'
            : 'Something went wrong, please try again';
      },
    });
  }
}
