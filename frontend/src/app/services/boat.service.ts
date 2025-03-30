import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Boat } from '../models/boat';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class BoatService {
  private apiUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.BOATS}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getBoats(): Observable<Boat[]> {
    return this.http.get<Boat[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getBoat(id: number): Observable<Boat> {
    return this.http.get<Boat>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  addBoat(boat: Boat): Observable<Boat> {
    return this.http.post<Boat>(this.apiUrl, boat, {
      headers: this.getHeaders(),
    });
  }

  updateBoat(id: number, boat: Boat): Observable<Boat> {
    return this.http.put<Boat>(`${this.apiUrl}/${id}`, boat, {
      headers: this.getHeaders(),
    });
  }

  deleteBoat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
