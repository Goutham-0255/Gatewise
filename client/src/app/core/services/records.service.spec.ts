import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { RecordsService } from './records.service';

describe('RecordsService', () => {
  let service: RecordsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RecordsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('calls GET /records without a delay param by default', () => {
    service.getRecords().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/records`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('delay')).toBeFalse();
    req.flush([]);
  });

  it('adds the delay param only when it is above zero', () => {
    service.getRecords(1500).subscribe();
    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/records`);
    expect(req.request.params.get('delay')).toBe('1500');
    req.flush([]);
  });
});
