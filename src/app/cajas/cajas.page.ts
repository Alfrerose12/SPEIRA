import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription, interval, switchMap, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { IonContent, MenuController } from '@ionic/angular';

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
  selector: 'app-cajas',
  templateUrl: './cajas.page.html',
  styleUrls: ['./cajas.page.scss'],
  standalone: false
})
export class CajasPage implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(IonContent, { static: false }) contentRef!: IonContent;

  cajasDisponibles: string[] = [];
  cajaSeleccionada: string = '';

  sensorData: SensorEntry[] = [];
  dataSubscription!: Subscription;
  refreshInterval = 5000;
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

  constructor(private apiService: ApiService, private menuCtrl: MenuController) { }

  ngOnInit() {
    this.apiService.getEstanquesDisponibles().subscribe({
      next: (estanques: { nombre: string }[]) => {
        if (estanques.length > 0) {
          this.cajasDisponibles = estanques
            .map(c => c.nombre)
            .filter(nombre => nombre.toLowerCase().includes('caja'));

          if (this.cajasDisponibles.length > 0) {
            this.cajaSeleccionada = this.cajasDisponibles[0];
            this.iniciarMonitorCaja();
          } else {
            console.warn('No hay cajas que coincidan con el filtro.');
          }
        }
      },
      error: (err) => {
        console.error('Error cargando cajas disponibles:', err);
      }
    });
  }

  iniciarMonitorCaja() {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();

    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => {
        return this.cajaSeleccionada
          ? this.apiService.getEstanqueData(this.cajaSeleccionada)
          : of(null);
      })
    ).subscribe(
      (response: any) => {

        const datos = response?.datos;
        if (!datos || datos.length === 0) {
          console.warn('No hay datos válidos para la caja:', this.cajaSeleccionada);
          return;
        }

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

        /* Lógica para notificaciones por fuera de límites
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
        });*/

        this.updateCharts();
      },
      err => console.error('Error obteniendo datos de la caja:', err)
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

  onCajaChange() {
    // Limpia datos previos
    this.sensorData = [];

    // Limpia los datos de los gráficos
    Object.values(this.sensorCharts).forEach(chart => {
      chart.data.labels = [];
      chart.data.datasets.forEach(dataset => dataset.data = []);
      chart.update();
    });

    // Reinicia el monitoreo de la caja seleccionada
    this.iniciarMonitorCaja();
  }

  async updateCharts() {
    const contentEl = await this.contentRef.getScrollElement();
    const scrollTop = contentEl.scrollTop;

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

    // Restaurar scroll después de actualizar los gráficos
    setTimeout(() => {
      this.contentRef.scrollToPoint(0, scrollTop, 0);
    }, 50);
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
}
