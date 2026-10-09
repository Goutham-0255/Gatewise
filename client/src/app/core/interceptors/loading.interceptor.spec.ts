import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { LoadingService } from '../services/loading.service';
import { loadingInterceptor } from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([loadingInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  afterEach(() => controller.verify());

  it('counts API calls while they are in flight', () => {
    http.get(`${environment.apiUrl}/records`).subscribe();
    expect(loading.pending).toBe(1);
    controller.expectOne(`${environment.apiUrl}/records`).flush([]);
    expect(loading.pending).toBe(0);
  });

  it('ignores calls to other hosts', () => {
    http.get('https://example.com/data').subscribe();
    expect(loading.pending).toBe(0);
    controller.expectOne('https://example.com/data').flush({});
  });

  it('decrements when the call fails', () => {
    http.get(`${environment.apiUrl}/records`).subscribe({ error: () => undefined });
    controller
      .expectOne(`${environment.apiUrl}/records`)
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    expect(loading.pending).toBe(0);
  });

  it('decrements when the call is cancelled', () => {
    const sub = http.get(`${environment.apiUrl}/records`).subscribe();
    expect(loading.pending).toBe(1);
    sub.unsubscribe();
    expect(loading.pending).toBe(0);
    expect(controller.expectOne(`${environment.apiUrl}/records`).cancelled).toBeTrue();
  });
});
