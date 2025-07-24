import { Component, OnDestroy, OnInit } from '@angular/core';
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
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false
})
export class SensorMonitoringPage implements OnInit, OnDestroy {

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

  selectedSensorFilter: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    setTimeout(() => {
      this.availableSensors.forEach(sensor => {
        this.createChart(sensor.canvasId, sensor.name, sensor.color);
      });
    }, 300);

    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => this.apiService.getSensorGeneralData())
    ).subscribe(
      (data: any[]) => {
        if (!Array.isArray(data)) return;
        this.sensorData = this.normalizeSensorData(data);
        this.updateCharts();
      },
      err => console.error('Error obteniendo datos de sensores:', err)
    );
  }

  ngOnDestroy() {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    Object.values(this.sensorCharts).forEach(chart => chart.destroy());
  }

  normalizeSensorData(data: any[]): SensorEntry[] {
    return data.map(item => {
      let key = '';
      switch (item.name.toLowerCase()) {
        case 'ph': key = 'ph'; break;
        case 'temperatura del agua': key = 'tempWater'; break;
        case 'temperatura ambiente': key = 'tempAmbient'; break;
        case 'humedad': key = 'humidity'; break;
        case 'luminosidad': key = 'luminosity'; break;
        case 'conductividad eléctrica': key = 'conductivity'; break;
        case 'co₂':
        case 'co2': key = 'co2'; break;
        default: key = item.name.toLowerCase().replace(/\s+/g, ''); break;
      }
      return {
        id: item.id,
        name: item.name,
        value: Number(item.value),
        unit: item.unit,
        timestamp: item.timestamp,
        key
      };
    });
  }

  shouldDisplaySensor(key: string): boolean {
    return !this.selectedSensorFilter || this.selectedSensorFilter === key;
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
          pointRadius: 0
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

  openMenu() {
    const menu = document.querySelector('ion-menu#filter-menu');
    if (menu && typeof (menu as any).open === 'function') {
      (menu as any).open();
    }
  }

  onFilterChange(value: string) {
    this.selectedSensorFilter = value;
  }
}
