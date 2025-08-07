import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: false,
})
export class ReportePage implements OnInit {

  estanque = '';
  periodo = '';
  fechaSeleccionada = '';
  generando = false;

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() { }

  navigateBack() {
    this.navCtrl.back();
  }

  obtenerPresentacionFecha(): string {
    switch (this.periodo) {
      case 'diario': return 'date';
      case 'semanal': return 'date';
      case 'mensual': return 'month';
      case 'anual': return 'year';
      default: return 'date';
    }
  }

  generarReporte() {
    if (!this.validarCampos()) return;

    this.generando = true;

    const body = {
      estanque: this.estanque.trim(),
      periodo: this.periodo,
      fecha: this.formatearFecha(this.fechaSeleccionada)
    };

    this.apiService.generarReporte(body).subscribe({
      next: (response) => this.descargarPDF(response),
      error: (err) => this.manejarError(err),
      complete: () => this.generando = false
    });
  }

  private formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  private validarCampos(): boolean {
    if (!this.estanque?.trim() || !this.periodo || !this.fechaSeleccionada) {
      alert('Completa todos los campos correctamente.');
      return false;
    }

    if (this.periodo === 'semanal') {
      const date = new Date(this.fechaSeleccionada);
      if (date.getDay() !== 1) {
        alert('Para reportes semanales, la fecha debe ser un lunes.');
        return false;
      }
    }

    if (!this.validarFormatoEstanque()) {
      alert('Formato sugerido: "Caja 10" o similar');
      return false;
    }

    return true;
  }

  private validarFormatoEstanque(): boolean {
    return /([A-Za-zÁ-Úá-úñÑ\s]+\s*\d+)/.test(this.estanque.trim());
  }

  private descargarPDF(data: Blob) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlBlob;
    a.download = `reporte_${this.periodo}_${this.fechaSeleccionada}.pdf`;
    a.click();
    URL.revokeObjectURL(urlBlob);
    this.generando = false;
  }

  private manejarError(err: any) {
    this.generando = false;
    console.error('Error al generar el reporte:', err);
    alert('No se pudo generar el reporte. Intenta nuevamente.');
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');

        this.router.navigate(['/login']);
        this.location.replaceState('/login');
      },
      error: (err) => {
        console.error('Error en logout:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        this.router.navigate(['/login']);
      }
    });
  }
}
