import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: false
})
export class ReportePage implements OnInit {

  reporte = {
    periodo: '',
    fecha: '',
  };

  PERIODOS_VALIDOS = ['diario', 'semanal', 'mensual', 'anual'];

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  actualizarFecha() {
    const hoy = new Date();
    switch (this.reporte.periodo) {
      case 'diario':
        this.reporte.fecha = hoy.toISOString().split('T')[0];
        break;
      case 'semanal':
        this.reporte.fecha = ''; // limpia para que seleccione un lunes
        break;
      case 'mensual':
        const mes = hoy.getMonth() + 1;
        const año = hoy.getFullYear();
        this.reporte.fecha = `${año}-${mes.toString().padStart(2, '0')}`;
        break;
      case 'anual':
        this.reporte.fecha = hoy.getFullYear().toString();
        break;
      default:
        this.reporte.fecha = '';
    }
  }

  validarLunes() {
    if (!this.reporte.fecha) return;

    // Extraer año-mes-día correctamente de la fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
    const fechaSolo = this.reporte.fecha.split('T')[0];
    const partes = fechaSolo.split('-');
    const year = Number(partes[0]);
    const month = Number(partes[1]) - 1; // Mes en JS empieza en 0
    const day = Number(partes[2]);

    const date = new Date(year, month, day);
    const diaSemana = date.getDay();

    if (diaSemana !== 1) {
      alert('❌ Debe seleccionar un día Lunes para el reporte semanal.');
      this.reporte.fecha = '';
    }
  }

  generarReporte() {
    const url = 'http://192.168.1.10:3000/api/datos/reportes';

    if (!this.PERIODOS_VALIDOS.includes(this.reporte.periodo)) {
      alert(`❌ Período inválido. Opciones válidas: ${this.PERIODOS_VALIDOS.join(', ')}`);
      return;
    }

    if (!this.reporte.fecha) {
      alert('❌ La fecha no puede estar vacía. Actualiza la fecha antes de generar el reporte.');
      return;
    }

    if (this.reporte.periodo === 'semanal') {
      // Validar que la fecha sea lunes justo antes de enviar
      const fechaSolo = this.reporte.fecha.split('T')[0];
      const partes = fechaSolo.split('-');
      const year = Number(partes[0]);
      const month = Number(partes[1]) - 1;
      const day = Number(partes[2]);
      const date = new Date(year, month, day);
      const diaSemana = date.getDay();

      if (diaSemana !== 1) {
        alert('❌ La fecha para reporte semanal debe ser un día lunes.');
        return;
      }
    }

    // Si el período es mensual, solo mandar año-mes
    let fechaFinal = this.reporte.fecha.trim();
    if (this.reporte.periodo === 'mensual') {
      fechaFinal = fechaFinal.slice(0, 7); // YYYY-MM
    }

    const body = {
      periodo: this.reporte.periodo,
      fecha: fechaFinal,
    };

    console.log('📄 Generando reporte con body:', body);

    this.http.post(url, body, { responseType: 'blob' }).subscribe({
      next: (response) => {
        console.log('✅ Reporte recibido correctamente. Generando descarga...');
        const blob = new Blob([response], { type: 'application/pdf' });
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlBlob;
        a.download = `reporte_${this.reporte.periodo}_${fechaFinal}.pdf`;
        a.click();
        window.URL.revokeObjectURL(urlBlob);
      },
      error: (err) => {
        console.error('❌ Error al generar el reporte:', err);
        if (err.status === 400) {
          alert('❌ No hay datos para el período seleccionado, verifica los datos ingresados.');
        } else {
          alert('❌ Error al generar el reporte. Verifica los datos o la conexión.');
        }
      },
    });
  }
}
