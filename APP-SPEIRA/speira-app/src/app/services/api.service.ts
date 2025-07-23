import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://192.168.1.70:3000/api'; 

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/iniciar-sesion`, { username, password });
  }

  register(fullName: string, email: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuario/registro`, { fullName, email, password, confirmPassword });
  }

  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuario/cerrar-sesion`, {});
  }

  report(reportType: string, date: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/datos/reportes`, { reportType, date });
  }

}
