import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: { nombre: string; email: string; password: string, rol: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/registro`, data, { withCredentials: true });
  }

  login(data: { email?: string; password: string; nombre?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/iniciar-sesion`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/cerrar-sesion`, {}, { withCredentials: true });
  }
  
  generarReporte(body: { estanque: string; periodo: string; fecha: string }): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/datos/reportes`, body, { 
      responseType: 'blob' 
    });
  }
}
