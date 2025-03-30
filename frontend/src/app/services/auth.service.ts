import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/auth';
import { API_CONFIG } from '../config/api.config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient, private router: Router) {}

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}${API_CONFIG.AUTH.LOGIN}`, request)
      .pipe(
        tap((response) => {
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  signup(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}${API_CONFIG.AUTH.REGISTER}`,
      request
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
