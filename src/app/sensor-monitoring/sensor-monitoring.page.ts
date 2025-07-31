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

interface Estanque {
  estanqueId: string;
  nombre: string;
  fecha: string;
  datos: { [key: string]: number };
}

Chart.register(...registerables);

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false
})
export class SensorMonitoringPage implements OnInit, OnDestroy, AfterViewInit {

  sensorData: SensorEntry[] = [];
  dataSubscription!: Subscription;
  refreshInterval = 2000;
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

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => this.apiService.getSensorGeneralData())
    ).subscribe(
      (response: any) => {
        console.log('Respuesta backend completa:', response);

        const resumenArray: Estanque[] = response?.resumen;
        if (!resumenArray || resumenArray.length === 0) {
          console.warn('No hay datos en el resumen:', response);
          return;
        }

        const sumData: { [key: string]: number } = {};
        const countData: { [key: string]: number } = {};

        // Suma y cuenta para promedio
        resumenArray.forEach((estanque) => {
          if (!estanque.datos) return;

          Object.entries(estanque.datos).forEach(([key, value]) => {
            if (typeof value !== 'number') return;

            if (!sumData[key]) sumData[key] = 0;
            if (!countData[key]) countData[key] = 0;

            sumData[key] += value;
            countData[key]++;
          });
        });

        // Calcular promedio
        const avgData: { [key: string]: number } = {};
        Object.keys(sumData).forEach(key => {
          avgData[key] = sumData[key] / countData[key];
        });

        // Timestamp más reciente
        const timestamps = resumenArray
          .map(e => new Date(e.fecha).getTime())
          .filter(t => !isNaN(t));
        const latestTimestamp = timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : new Date().toISOString();

        // Mapeo para gráficas
        const flatData: SensorEntry[] = Object.entries(avgData).map(([key, value]) => {
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
            value: Number(value.toFixed(2)),
            unit,
            timestamp: latestTimestamp,
            key: finalKey
          };
        });

        this.sensorData = flatData;
        this.updateCharts();
      },
      err => console.error('Error obteniendo datos de sensores:', err)
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

  updateCharts() {
    this.availableSensors.forEach(sensor => {
      // Si hay filtro y este sensor no es el seleccionado, saltamos
      if (this.selectedSensorFilter && sensor.key !== this.selectedSensorFilter) {
        return;
      }

      const chart = this.sensorCharts[sensor.canvasId];
      if (!chart) return;

      const latest = this.sensorData.find(d => d.key === sensor.key);
      if (!latest) return;

      const dataset = chart.data.datasets[0];
      const data = dataset.data as number[];
      const labels = chart.data.labels as string[];

      data.push(latest.value);
      if (data.length > 30) data.shift();

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

  openMenu() {
    const menu = document.querySelector('ion-menu#filter-menu');
    if (menu && typeof (menu as any).open === 'function') {
      (menu as any).open();
    }
  }

  onFilterChange(value: string) {
    this.selectedSensorFilter = value;
  }

  shouldDisplaySensor(sensorKey: string): boolean {
    const allowedKeys = this.availableSensors.map(sensor => sensor.key);
    return allowedKeys.includes(sensorKey);
  }
}
