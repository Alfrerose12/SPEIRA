import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

interface SensorEntry {
  id: number;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  key: string; // Added key property
}

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false
})
export class SensorMonitoringPage implements OnInit, OnDestroy {

  sensorData: SensorEntry[] = [];
  dataSubscription!: Subscription;
  refreshInterval = 1000; // 1 segundo

  // Chart.js instancia por sensor (la clave es el canvasId)
  sensorCharts: { [key: string]: Chart } = {};

  // Sensores disponibles y sus claves que usan en datos y gráficos
  availableSensors = [
    { key: 'ph', name: 'pH', unit: 'pH', canvasId: 'phChart', color: '#4caf50' },
    { key: 'tempWater', name: 'Temperatura del agua', unit: '°C', canvasId: 'tempWaterChart', color: '#2196f3' },
    { key: 'tempAmbient', name: 'Temperatura ambiente', unit: '°C', canvasId: 'tempAmbientChart', color: '#f44336' },
    { key: 'humidity', name: 'Humedad', unit: '%', canvasId: 'humidityChart', color: '#ff9800' },
    { key: 'luminosity', name: 'Luminosidad', unit: 'lux', canvasId: 'lightChart', color: '#9c27b0' },
    { key: 'conductivity', name: 'Conductividad eléctrica', unit: 'µS/cm', canvasId: 'conductivityChart', color: '#3f51b5' },
    { key: 'co2', name: 'CO₂', unit: 'ppm', canvasId: 'co2Chart', color: '#009688' }
  ];

  // Filtro para mostrar sensores (empty = mostrar todos)
  selectedSensorFilter: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Crear las gráficas inicialmente
    setTimeout(() => {
      this.availableSensors.forEach(sensor => {
        this.createChart(sensor.canvasId, sensor.name, sensor.color);
      });
    }, 300);

    // Suscribirse para actualizar datos periódicamente
    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => this.apiService.getSensorGeneralData())
    ).subscribe(
      (data: any) => {
        // Asumimos que 'data' es un arreglo de sensores
        this.sensorData = this.normalizeSensorData(data);
        this.updateCharts();
      },
      err => {
        console.error('Error obteniendo datos de sensores:', err);
      }
    );
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    // Destruir las gráficas para liberar memoria
    Object.values(this.sensorCharts).forEach(chart => chart.destroy());
  }

  // Normaliza datos para que tengan key consistente y valor numérico
  normalizeSensorData(data: any[]): SensorEntry[] {
    // Mapear para unificar claves a las que definimos en availableSensors
    // Ejemplo: pH -> ph, Temperatura del agua -> tempWater, etc.
    // Aquí debes adaptar según lo que venga de la API

    return data.map(item => {
      let key = '';
      // Detectar key según name (ajusta esto según tus datos reales)
      switch (item.name.toLowerCase()) {
        case 'ph': key = 'ph'; break;
        case 'temperatura del agua': key = 'tempWater'; break;
        case 'temperatura ambiente': key = 'tempAmbient'; break;
        case 'humedad': key = 'humidity'; break;
        case 'luminosidad': key = 'luminosity'; break;
        case 'conductividad eléctrica': key = 'conductivity'; break;
        case 'co₂': key = 'co2'; break;
        default: key = item.name.toLowerCase().replace(/\s+/g, ''); break;
      }
      return {
        id: item.id,
        name: item.name,
        value: Number(item.value),
        unit: item.unit,
        timestamp: item.timestamp,
        key: key
      } as any; // Extiendo con 'key'
    });
  }

  // Indica si mostrar el sensor según filtro
  shouldDisplaySensor(key: string): boolean {
    if (!this.selectedSensorFilter || this.selectedSensorFilter === '') return true;
    return this.selectedSensorFilter === key;
  }

  // Actualiza los datos en las gráficas
  updateCharts() {
    this.availableSensors.forEach(sensor => {
      const chart = this.sensorCharts[sensor.canvasId];
      if (!chart) return;

      // Filtrar dato actual para este sensor
      const latest = this.sensorData.find(d => d.key === sensor.key);
      if (!latest) return;

      const dataset = chart.data.datasets[0];
      const data = dataset.data as number[];

      data.push(latest.value);
      if (data.length > 30) {
        data.shift(); // mantener solo 30 puntos en la gráfica
      }

      // Actualizar etiquetas X (pueden ser timestamps o simplemente vacíos)
      if (!chart.data.labels) chart.data.labels = [];
      const labels = chart.data.labels as string[];
      labels.push(new Date(latest.timestamp).toLocaleTimeString());
      if (labels.length > 30) {
        labels.shift();
      }

      chart.update();
    });
  }

  // Crear gráfico lineal
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
          backgroundColor: color + '55', // color con transparencia
          fill: true,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: {
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

  // Abrir menú lateral filtro (desde HTML)
  openMenu() {
    const menu = document.querySelector('ion-menu#filter-menu');
    if (menu && typeof (menu as any).open === 'function') {
      (menu as any).open();
    }
  }

  // Cambiar filtro al seleccionar segmento
  onFilterChange(value: string) {
    this.selectedSensorFilter = value;
  }
}
