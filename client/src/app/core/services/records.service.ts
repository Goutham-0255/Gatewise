import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecordItem } from '../models/record.model';

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private readonly http = inject(HttpClient);

  /** Admins get every record, General Users only their own (the server decides). */
  getRecords(delay = 0): Observable<RecordItem[]> {
    const params = delay > 0 ? new HttpParams().set('delay', delay) : undefined;
    return this.http.get<RecordItem[]>(`${environment.apiUrl}/records`, { params });
  }
}
