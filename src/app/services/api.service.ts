import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://192.168.1.124:3000/api';

  constructor(private http: HttpClient) {}

  login(data: { email?: string; password: string; nombre?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/iniciar-sesion`, data, { withCredentials: true });
  }

  register(data: { nombre: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/registro`, data, { withCredentials: true });
  }
}