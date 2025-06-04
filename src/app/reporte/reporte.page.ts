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

  ngOnInit() {
   
  }

  constructor(private http: HttpClient) { }

  actualizarFecha() {
    const hoy = new Date();
    switch (this.reporte.periodo) {
      case 'diario':
        this.reporte.fecha = hoy.toISOString().split('T')[0];
        break;
      case 'semanal':
        const diaSemana = hoy.getDay();
        const lunes = new Date(hoy.setDate(hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1)));
        this.reporte.fecha = lunes.toISOString().split('T')[0];
        break;
      case 'mensual':
        this.reporte.fecha = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'anual':
        this.reporte.fecha = hoy.getFullYear().toString();
        break;
      default:
        this.reporte.fecha = '';
    }
  }

  generarReporte() {
    const url = `http://192.168.1.133:3000/api/datos/reportes`;
    const params = {
      periodo: this.reporte.periodo,
      fecha: this.reporte.fecha,
    };

    this.http.get(url, { params, responseType: 'blob' }).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${this.reporte.periodo}_${this.reporte.fecha}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al generar el reporte:', err);
        alert('Error al generar el reporte. Verifica los datos ingresados.');
      },
    });
  }
}
