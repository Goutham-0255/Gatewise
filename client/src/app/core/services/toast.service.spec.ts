import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TOAST_DURATION_MS, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = TestBed.inject(ToastService);
  });

  it('adds toasts and auto-dismisses them', fakeAsync(() => {
    service.success('Saved');
    service.error('Failed');
    expect(service.toasts().map((t) => t.type)).toEqual(['success', 'error']);
    tick(TOAST_DURATION_MS);
    expect(service.toasts().length).toBe(0);
  }));

  it('dismisses a toast on demand', fakeAsync(() => {
    service.success('Saved');
    service.dismiss(service.toasts()[0].id);
    expect(service.toasts().length).toBe(0);
    tick(TOAST_DURATION_MS);
  }));
});
