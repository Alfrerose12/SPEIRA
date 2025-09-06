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
    this.inicializarFechaPorDefecto(); // ← Añadido
  }

  navigateBack() {
    this.navCtrl.back();
  }

  // NUEVO: Inicializar fecha por defecto
  inicializarFechaPorDefecto() {
    const fechaActual = new Date();
    this.fechaSeleccionada = fechaActual.toISOString();
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

  // NUEVO: Manejar cambio de período
  onPeriodoChange() {
    // Cuando cambia el período, ajustar la fecha seleccionada
    if (this.fechaSeleccionada) {
      this.ajustarFechaAlPeriodo();
    }
  }

  // NUEVO: Ajustar fecha según el período seleccionado
  private ajustarFechaAlPeriodo() {
    const fecha = new Date(this.fechaSeleccionada);
    
    switch (this.periodo) {
      case 'semanal':
        // Ajustar al lunes de la semana
        const diaSemana = fecha.getDay();
        const diff = fecha.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        fecha.setDate(diff);
        break;
      
      case 'mensual':
        // Ajustar al primer día del mes
        fecha.setDate(1);
        break;
      
      case 'anual':
        // Ajustar al primer día del año
        fecha.setMonth(0);
        fecha.setDate(1);
        break;
    }
    
    this.fechaSeleccionada = fecha.toISOString();
  }

  generarReporte() {
    if (!this.validarCampos()) return;

    this.generando = true;

    const body = {
      estanque: this.estanqueSeleccionado.trim(),
      periodo: this.periodo,
      fecha: this.formatearFechaParaAPI() // ← Método modificado
    };

    console.log('Enviando:', body);

    this.apiService.generarReporte(body).subscribe({
      next: (response: Blob) => this.descargarPDF(response),
      error: (err) => this.manejarError(err),
      complete: () => this.generando = false
    });
  }

  // MODIFICADO: Formatear fecha para la API correctamente
  private formatearFechaParaAPI(): string {
    if (!this.fechaSeleccionada) return '';
    
    const fecha = new Date(this.fechaSeleccionada);
    
    switch (this.periodo) {
      case 'diario':
        return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      
      case 'semanal':
        // Para semanal, devolver el lunes de la semana
        return fecha.toISOString().split('T')[0];
      
      case 'mensual':
        // YYYY-MM
        return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      
      case 'anual':
        // YYYY
        return fecha.getFullYear().toString();
      
      default:
        return fecha.toISOString().split('T')[0];
    }
  }

  // MODIFICADO: Validación mejorada
  private validarCampos(): boolean {
    if (!this.estanqueSeleccionado?.trim() || !this.periodo || !this.fechaSeleccionada) {
      alert('Completa todos los campos correctamente.');
      return false;
    }

    // Validar que no sea un mensaje de error
    if (this.estanqueSeleccionado === 'No hay unidades disponibles' || 
        this.estanqueSeleccionado === 'Error al cargar unidades') {
      alert('Selecciona una unidad válida.');
      return false;
    }

    // Validación específica para período semanal
    if (this.periodo === 'semanal') {
      const fecha = new Date(this.fechaSeleccionada);
      // Validar que sea lunes (día 1 de la semana, donde 0 es domingo)
      if (fecha.getDay() !== 1) {
        alert('Para reportes semanales, la fecha debe ser un lunes.');
        return false;
      }
    }

    return true;
  }

  private descargarPDF(pdfBlob: Blob) {
    try {
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;

      const fechaFormateada = this.formatearFechaParaNombre(this.fechaSeleccionada);
      // Limpiar el nombre del estanque para el nombre de archivo
      const nombreEstanque = this.estanqueSeleccionado.replace(/[^a-zA-Z0-9]/g, '_');
      downloadLink.download = `reporte_${nombreEstanque}_${this.periodo}_${fechaFormateada}.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(pdfUrl);
        this.generando = false; // ← Asegurar que se resetee el estado
      }, 100);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el reporte. Intenta nuevamente.');
      this.generando = false;
    }
  }

  private formatearFechaParaNombre(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toISOString().split('T')[0].replace(/-/g, '');
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