import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthRequest, AuthResponse } from '../models/auth';
import { API_CONFIG } from '../config/api.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockRequest: AuthRequest = {
    username: 'testuser',
    password: 'testpass',
  };
  const mockResponse: AuthResponse = { token: 'mock-jwt-token' };
  const baseUrl = API_CONFIG.BASE_URL;
  const loginUrl = `${baseUrl}${API_CONFIG.AUTH.LOGIN}`;
  const signupUrl = `${baseUrl}${API_CONFIG.AUTH.REGISTER}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(), // Required for HttpClient
        provideHttpClientTesting(), // Replaces HttpClientTestingModule
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear and mock localStorage
    localStorage.clear();
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'removeItem').and.callThrough();
    spyOn(localStorage, 'getItem').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request and store token on success', () => {
      service.login(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.token).toBeDefined(); // Handle optional token
        if (response.token) {
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'token',
            response.token
          );
        }
      });

      const req = httpMock.expectOne(loginUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle login error and not store token', () => {
      service.login(mockRequest).subscribe({
        next: () => fail('Should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          expect(localStorage.setItem).not.toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne(loginUrl);
      req.flush('Invalid credentials', {
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    it('should not store token if response has no token', () => {
      const emptyResponse: AuthResponse = { token: undefined };
      service.login(mockRequest).subscribe((response) => {
        expect(response).toEqual(emptyResponse);
        expect(response.token).toBeUndefined();
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });

      const req = httpMock.expectOne(loginUrl);
      req.flush(emptyResponse);
    });
  });

  describe('signup', () => {
    it('should send signup request and return response', () => {
      service.signup(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });

      const req = httpMock.expectOne(signupUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle signup error', () => {
      service.signup(mockRequest).subscribe({
        next: () => fail('Should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        },
      });

      const req = httpMock.expectOne(signupUrl);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      localStorage.setItem('token', 'some-token');
      service.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should do nothing if no token exists', () => {
      service.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'some-token');
      expect(service.isLoggedIn()).toBeTrue();
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should return false when token is null', () => {
      expect(service.isLoggedIn()).toBeFalse();
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should return false when token is empty', () => {
      localStorage.setItem('token', '');
      expect(service.isLoggedIn()).toBeFalse();
      expect(localStorage.getItem).toHaveBeenCalledWith('token');
    });
  });
});
