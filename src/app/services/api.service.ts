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

  register(data: { nombre: string; email: string; password: string; rol: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/registro`, data, { withCredentials: true });
  }

  login(data: { email?: string; password: string; nombre?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/iniciar-sesion`, data, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/cerrar-sesion`, {}, { withCredentials: true });
  }

  actualizarUsuario(data: { email?: string; password?: string; nombre?: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuario/actualizar`, data, { withCredentials: true });
  }

  generarReporte(body: { estanque: string; periodo: string; fecha: string }): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/datos/reportes`, body, {
      responseType: 'blob'
    });
  }

  getSensorGeneralData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/datos/generales`);
  }

  getEstanqueData(nombre: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/datos/estanque/${encodeURIComponent(nombre)}`);
  }

  getEstanquesDisponibles(): Observable<{ nombre: string }[]> {
    return this.http.get<{ nombre: string }[]>(`${this.baseUrl}/estanques`);
  }

  getCajasDisponibles(): Observable<{ nombre: string }[]> {
    return this.http.get<{ nombre: string }[]>(`${this.baseUrl}/cajas`);
  }

  getCajaData(nombreCaja: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cajas/${nombreCaja}/datos`);
  }

  // 🔔 Funciones de notificaciones 🔔

  /**
   * Guarda el token de notificaciones en el backend
   */
  guardarTokenNotificacion(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/notificaciones/token`, { token });
  }

  /**
   * Envía una notificación push manual desde el frontend (admin)
   */
  enviarNotificacion(payload: { titulo: string; cuerpo: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/notificaciones`, payload);
  }
}
