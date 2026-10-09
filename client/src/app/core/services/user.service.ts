import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserPayload, UpdateUserPayload, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(this.url, payload);
  }

  updateUser(id: string, patch: UpdateUserPayload): Observable<User> {
    return this.http.put<User>(`${this.url}/${id}`, patch);
  }

  /** The server answers 204 with no body. */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
