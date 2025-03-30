import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('errorInterceptor', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should logout and redirect on network error (status 0)', fakeAsync(() => {
    httpClient.get('/test').subscribe({
      error: (err) => {
        expect(err.status).toBe(0);
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      },
    });

    const req = httpTestingController.expectOne('/test');
    req.error(new ProgressEvent('error')); // Simulate network error (status 0)
    tick(); // Process the error
  }));

  it('should not logout on 200 OK', fakeAsync(() => {
    httpClient.get('/test').subscribe({
      next: (response) => expect(response).toBe('success'),
      error: () => fail('Should not error'),
    });

    const req = httpTestingController.expectOne('/test');
    req.flush('success', { status: 200, statusText: 'OK' });
    tick(); // Process the response

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));
});
