import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription, interval, switchMap, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { MenuController } from '@ionic/angular';

interface SensorEntry {
  id: number;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  key: string;
}

Chart.register(...registerables);

@Component({
  selector: 'app-estanques',
  templateUrl: './estanques.page.html',
  styleUrls: ['./estanques.page.scss'],
  standalone: false
})
export class EstanquesPage implements OnInit, OnDestroy, AfterViewInit {

  estanquesDisponibles: string[] = [];
  estanqueSeleccionado: string = '';

  sensorData: SensorEntry[] = [];
  dataSubscription!: Subscription;
  refreshInterval = 2000;
  sensorCharts: { [key: string]: Chart } = {};

  selectedSensorFilter: string = '';

  availableSensors = [
    { key: 'ph', name: 'pH', unit: 'pH', canvasId: 'phChart', color: '#4caf50' },
    { key: 'temperaturaAgua', name: 'Temperatura del Agua', unit: '°C', canvasId: 'tempWaterChart', color: '#2196f3' },
    { key: 'temperaturaAmbiente', name: 'Temperatura Ambiente', unit: '°C', canvasId: 'tempAmbientChart', color: '#f44336' },
    { key: 'humedad', name: 'Humedad', unit: '%', canvasId: 'humidityChart', color: '#ff9800' },
    { key: 'luminosidad', name: 'Luminosidad', unit: 'lux', canvasId: 'lightChart', color: '#9c27b0' },
    { key: 'conductividadElectrica', name: 'Conductividad Eléctrica', unit: 'µS/cm', canvasId: 'conductivityChart', color: '#3f51b5' },
    { key: 'co2', name: 'CO₂', unit: 'ppm', canvasId: 'co2Chart', color: '#009688' }
  ];

  sensorLimits: { [key: string]: { min: number, max: number } } = {
    ph: { min: 8, max: 11 },
    temperaturaAgua: { min: 10, max: 50 },
    temperaturaAmbiente: { min: 15, max: 50 },
    humedad: { min: 20, max: 100 },
    luminosidad: { min: 2000, max: 50000 },
    conductividadElectrica: { min: 5, max: 20 },
    co2: { min: 3, max: 18 }
  };

  private notifiedSensors: { [key: string]: boolean } = {};

  constructor(private apiService: ApiService, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.apiService.getEstanquesDisponibles().subscribe({
      next: (estanques: { nombre: string }[]) => {
        if (estanques.length > 0) {
          this.estanquesDisponibles = estanques.map(e => e.nombre);
          this.estanqueSeleccionado = this.estanquesDisponibles[0];
          this.iniciarMonitorEstanque();
        }
      },
      error: (err) => {
        console.error('Error cargando estanques disponibles:', err);
      }
    });
  }

  iniciarMonitorEstanque() {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();

    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => {
        return this.estanqueSeleccionado
          ? this.apiService.getEstanqueData(this.estanqueSeleccionado)
          : of(null);
      })
    ).subscribe(
      (response: any) => {
        console.log('Datos recibidos del backend:', response); // <--- Aquí el console.log

        const datos = response?.datos;
        if (!datos || datos.length === 0) {
          console.warn('No hay datos válidos para el estanque:', this.estanqueSeleccionado);
          return;
        }

        // Extraemos los últimos datos válidos para cada sensor
        const flatData: SensorEntry[] = this.availableSensors.map(sensor => {
          // Ordena datos por fecha descendente
          const sortedDatos = [...datos].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.fecha).getTime();
            const dateB = new Date(b.updatedAt || b.fecha).getTime();
            return dateB - dateA;
          });

          // Encuentra el dato más reciente con valor definido
          const lastValid = sortedDatos.find(d => typeof d[sensor.key] !== 'undefined' && d[sensor.key] !== null);

          return {
            id: 0,
            name: sensor.name,
            value: lastValid ? Number(lastValid[sensor.key]) : 0,
            unit: sensor.unit,
            timestamp: lastValid?.updatedAt || lastValid?.fecha || new Date().toISOString(),
            key: sensor.key
          };
        });

        this.sensorData = flatData;

        // Lógica para notificaciones por fuera de límites
        flatData.forEach(sensor => {
          const limit = this.sensorLimits[sensor.key];
          if (!limit) return;

          const isOutOfRange = sensor.value < limit.min || sensor.value > limit.max;

          if (isOutOfRange && !this.notifiedSensors[sensor.key]) {
            this.enviarNotificacion(sensor.name, sensor.value);  // <-- Cambio aquí para usar objeto payload
            this.notifiedSensors[sensor.key] = true;
          } else if (!isOutOfRange && this.notifiedSensors[sensor.key]) {
            this.notifiedSensors[sensor.key] = false;
          }
        });

        this.updateCharts();
      },
      err => console.error('Error obteniendo datos del estanque:', err)
    );
  }

  ngAfterViewInit() {
    this.availableSensors.forEach(sensor => {
      this.createChart(sensor.canvasId, sensor.name, sensor.color);
    });
  }

  ngOnDestroy() {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    Object.values(this.sensorCharts).forEach(chart => chart.destroy());
  }

  onEstanqueChange() {
    // Limpia datos previos
    this.sensorData = [];

    // Limpia los datos de los gráficos
    Object.values(this.sensorCharts).forEach(chart => {
      chart.data.labels = [];
      chart.data.datasets.forEach(dataset => dataset.data = []);
      chart.update();
    });

    // Reinicia el monitoreo del estanque seleccionado
    this.iniciarMonitorEstanque();
  }


  updateCharts() {
    this.availableSensors.forEach(sensor => {
      if (this.selectedSensorFilter && sensor.key !== this.selectedSensorFilter) return;

      const chart = this.sensorCharts[sensor.canvasId];
      if (!chart) return;

      const latest = this.sensorData.find(d => d.key === sensor.key);
      if (!latest) return;

      const dataset = chart.data.datasets[0];
      const data = dataset.data as number[];

      data.push(latest.value);
      if (data.length > 30) data.shift();

      const labels = chart.data.labels as string[];
      labels.push(new Date(latest.timestamp).toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour12: false }));
      if (labels.length > 30) labels.shift();

      dataset.data = [...data];
      chart.data.labels = [...labels];

      chart.update();
    });
  }

  createChart(canvasId: string, label: string, color: string) {
    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label,
          data: [],
          borderColor: color,
          backgroundColor: color + '55',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointBackgroundColor: color,
          pointHoverRadius: 5,
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: {
            type: 'category',
            display: true,
            ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }
          },
          y: {
            beginAtZero: true,
            ticks: { maxTicksLimit: 6 }
          }
        },
        plugins: {
          legend: { display: true }
        }
      }
    });

    this.sensorCharts[canvasId] = chart;
  }

  shouldDisplaySensor(key: string): boolean {
    return this.selectedSensorFilter === '' || this.selectedSensorFilter === key;
  }

  openMenu() {
    this.menuCtrl.open('filter-menu');
  }

  // Cambio aquí: enviarNotificacion ahora arma payload para backend con titulo y cuerpo
  enviarNotificacion(sensorNombre: string, valor: number) {
    const token = localStorage.getItem('fcmToken'); // 🔽 tomamos el token guardado

    if (!token) {
      console.warn('⚠️ No se encontró token FCM en localStorage');
      return;
    }

    const payload = {
      titulo: `Alerta: ${sensorNombre}`,
      cuerpo: `El valor actual (${valor.toString()}) está fuera del rango permitido.`,
      token
    };

    console.log('👉 Payload que se enviará:', payload);

    this.apiService.enviarNotificacion(payload).subscribe({
      next: (response) => {
        console.log('✅ Notificación enviada con éxito:', response);
      },
      error: (err) => {
        console.error('❌ Error al enviar notificación:', err);
        if (err.error) console.error('Detalle error:', err.error);
      }
    });
  }


}
