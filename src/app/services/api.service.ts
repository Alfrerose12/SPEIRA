import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api.speira.site/api';

  constructor(private http: HttpClient) {}

  register(data: { nombre: string; email: string; password: string, rol: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/registro`, data, { withCredentials: true });
  }

  login(data: { email?: string; password: string; nombre?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/iniciar-sesion`, data, { withCredentials: true });
  }
}
