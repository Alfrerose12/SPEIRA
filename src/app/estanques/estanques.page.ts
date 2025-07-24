import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

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
})
export class EstanquesPage implements OnInit, OnDestroy, AfterViewInit {

  estanquesDisponibles: string[] = [];
  selectedEstanque: string = '';
  sensorData: SensorEntry[] = [];
  dataSubscription!: Subscription;
  refreshInterval = 1000;
  sensorCharts: { [key: string]: Chart } = {};

  availableSensors = [
    { key: 'ph', name: 'pH', unit: 'pH', canvasId: 'phChart', color: '#4caf50' },
    { key: 'tempWater', name: 'Temperatura del agua', unit: '°C', canvasId: 'tempWaterChart', color: '#2196f3' },
    { key: 'tempAmbient', name: 'Temperatura ambiente', unit: '°C', canvasId: 'tempAmbientChart', color: '#f44336' },
    { key: 'humidity', name: 'Humedad', unit: '%', canvasId: 'humidityChart', color: '#ff9800' },
    { key: 'luminosity', name: 'Luminosidad', unit: 'lux', canvasId: 'lightChart', color: '#9c27b0' },
    { key: 'conductivity', name: 'Conductividad eléctrica', unit: 'µS/cm', canvasId: 'conductivityChart', color: '#3f51b5' },
    { key: 'co2', name: 'CO₂', unit: 'ppm', canvasId: 'co2Chart', color: '#009688' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarEstanquesDisponibles();
  }

  cargarEstanquesDisponibles() {
    this.apiService.getEstanquesDisponibles().subscribe({
      next: (estanques: string[]) => {
        this.estanquesDisponibles = estanques;
        if (estanques.length > 0) {
          this.selectedEstanque = estanques[0];
          this.iniciarActualizacionDatos();
        }
      },
      error: (err) => {
        console.error('Error cargando estanques disponibles:', err);
      }
    });
  }

  iniciarActualizacionDatos() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => this.apiService.getEstanqueData(this.selectedEstanque))
    ).subscribe({
      next: (datos: any) => {
        if (!datos || typeof datos !== 'object') {
          console.warn('No hay datos válidos para el estanque:', datos);
          return;
        }

        const timestamp = new Date().toISOString();

        const flatData: SensorEntry[] = Object.entries(datos).map(([key, value]) => {
          let name = '';
          let unit = '';
          let finalKey = '';

          switch (key) {
            case 'ph': name = 'pH'; unit = 'pH'; finalKey = 'ph'; break;
            case 'temperaturaAgua': name = 'Temperatura del agua'; unit = '°C'; finalKey = 'tempWater'; break;
            case 'temperaturaAmbiente': name = 'Temperatura ambiente'; unit = '°C'; finalKey = 'tempAmbient'; break;
            case 'humedad': name = 'Humedad'; unit = '%'; finalKey = 'humidity'; break;
            case 'luminosidad': name = 'Luminosidad'; unit = 'lux'; finalKey = 'luminosity'; break;
            case 'conductividadElectrica': name = 'Conductividad eléctrica'; unit = 'µS/cm'; finalKey = 'conductivity'; break;
            case 'co2': name = 'CO₂'; unit = 'ppm'; finalKey = 'co2'; break;
            default: name = key; finalKey = key; unit = ''; break;
          }

          return {
            id: 0,
            name,
            value: Number(value),
            unit,
            timestamp,
            key: finalKey
          };
        });

        this.sensorData = flatData;
        this.updateCharts();
      },
      error: (err) => {
        console.error('Error al obtener datos del estanque:', err);
      }
    });
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

  updateCharts() {
    this.availableSensors.forEach(sensor => {
      const chart = this.sensorCharts[sensor.canvasId];
      if (!chart) return;

      const latest = this.sensorData.find(d => d.key === sensor.key);
      if (!latest) return;

      const dataset = chart.data.datasets[0];
      const data = dataset.data as number[];

      data.push(latest.value);
      if (data.length > 30) data.shift();

      const labels = chart.data.labels as string[];
      labels.push(new Date(latest.timestamp).toLocaleTimeString());
      if (labels.length > 30) labels.shift();

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

  onEstanqueChange(estanque: string) {
    if (estanque === this.selectedEstanque) return;
    this.selectedEstanque = estanque;
    this.iniciarActualizacionDatos();
  }

  shouldDisplaySensor(sensorKey: string): boolean {
    const allowedKeys = this.availableSensors.map(sensor => sensor.key);
    return allowedKeys.includes(sensorKey);
  }

}
