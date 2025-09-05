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

  estanquesDisponibles: string[] = [];
  estanqueSeleccionado = '';
  cargando = true;
  error = false;

  periodo = '';
  fechaSeleccionada = '';
  generando = false;

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() { 
    this.cargarEstanquesDisponibles();
  }

  navigateBack() {
    this.navCtrl.back();
  }

  cargarEstanquesDisponibles() {
    this.cargando = true;
    this.error = false;
    
    this.apiService.getEstanquesDisponibles().subscribe({
      next: (estanques: { nombre: string }[]) => {
        this.cargando = false;
        
        if (estanques && estanques.length > 0) {
          this.estanquesDisponibles = estanques
            .map(e => e.nombre)
            .filter(nombre => {
              const nombreLower = nombre.toLowerCase();
              return nombreLower.includes('estanque') ||
                nombreLower.includes('caja') ||
                nombreLower.includes('piscina');
            });

          if (this.estanquesDisponibles.length > 0) {
            this.estanqueSeleccionado = this.estanquesDisponibles[0];
          } else {
            console.warn('No hay estanques, cajas o piscinas disponibles.');
            this.estanquesDisponibles = ['No hay unidades disponibles'];
          }
        } else {
          this.estanquesDisponibles = ['No hay unidades disponibles'];
        }
      },
      error: (err) => {
        this.cargando = false;
        this.error = true;
        console.error('Error cargando unidades disponibles:', err);
        this.estanquesDisponibles = ['Error al cargar unidades'];
      }
    });
  }

  obtenerPresentacionFecha(): string {
    switch (this.periodo) {
      case 'diario': return 'date';
      case 'semanal': return 'week';
      case 'mensual': return 'month';
      case 'anual': return 'year';
      default: return 'date';
    }
  }

  generarReporte() {
    if (!this.validarCampos()) return;

    this.generando = true;

    const body = {
      estanque: this.estanqueSeleccionado.trim(),
      periodo: this.periodo,
      fecha: this.formatearFecha(this.fechaSeleccionada)
    };

    console.log('Enviando:', body); // Para debug

    this.apiService.generarReporte(body).subscribe({
      next: (response: Blob) => this.descargarPDF(response),
      error: (err) => this.manejarError(err),
      complete: () => this.generando = false
    });
  }

  private formatearFecha(fecha: string): string {
    if (this.periodo === 'mensual') {
      return fecha.substring(0, 7);

    } else if (this.periodo === 'anual') {
      return fecha.substring(0, 4);
    }

    return fecha.split('T')[0];
  }

  private validarCampos(): boolean {
    if (!this.estanqueSeleccionado?.trim() || !this.periodo || !this.fechaSeleccionada) {
      alert('Completa todos los campos correctamente.');
      return false;
    }

    if (this.estanqueSeleccionado === 'No hay unidades disponibles' || 
        this.estanqueSeleccionado === 'Error al cargar unidades') {
      alert('Selecciona una unidad válida.');
      return false;
    }

    if (!this.validarFormatoEstanque()) {
      alert('Por favor selecciona una unidad válida de la lista.');
      return false;
    }

    return true;
  }

  private validarFormatoEstanque(): boolean {

    return this.estanqueSeleccionado.trim().length > 0 &&
           this.estanqueSeleccionado !== 'No hay unidades disponibles' &&
           this.estanqueSeleccionado !== 'Error al cargar unidades';
  }

  private descargarPDF(pdfBlob: Blob) {
    try {
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      
      const fechaFormateada = this.formatearFechaParaNombre(this.fechaSeleccionada);
      downloadLink.download = `reporte_${this.estanqueSeleccionado}_${this.periodo}_${fechaFormateada}.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pdfUrl);
      }, 100);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el reporte. Intenta nuevamente.');
    }
  }

  private formatearFechaParaNombre(fecha: string): string {
    return fecha.split('T')[0].replace(/-/g, '');
  }

  private manejarError(err: any) {
    this.generando = false;
    console.error('Error al generar el reporte:', err);
    
    if (err.status === 404) {
      alert('No se encontraron datos para el reporte solicitado.');
    } else if (err.status === 500) {
      alert('Error del servidor. Intenta nuevamente más tarde.');
    } else {
      alert('No se pudo generar el reporte. Verifica los datos e intenta nuevamente.');
    }
  }

  logout() {
    this.apiService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('userRole');
        this.router.navigate(['/login']);
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