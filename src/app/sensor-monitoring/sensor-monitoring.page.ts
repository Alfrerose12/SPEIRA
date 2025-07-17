import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { interval, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, tap, throttleTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

interface SensorData {
  id: number;
  name: string;
  displayName: string;
  value: number;
  unit: string;
  timestamp: Date;
}

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false
})
export class SensorMonitoringPage implements OnInit, OnDestroy, AfterViewInit {
  sensorData: SensorData[] = [];
  loading = true;
  error: string | null = null;

  selectedSensorFilter: string = '';
  availableSensors: string[] = [
    'pH',
    'Temperatura del Agua',
    'Temperatura Ambiente',
    'Humedad',
    'Luminosidad',
    'Conductividad',
    'CO₂'
  ];

  private dataSubscription!: Subscription;
  private charts: Map<string, Chart> = new Map();
  private readonly API_URL = 'http://192.168.1.101:3000/api/datos/generales';
  private readonly UPDATE_INTERVAL = 1000;

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.initializeDataStream();
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeDataStream(): void {
    this.dataSubscription = interval(this.UPDATE_INTERVAL).pipe(
      throttleTime(1000),
      tap(() => this.loading = true),
      switchMap(() => this.fetchSensorData()),
      catchError(error => {
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
        return throwError(() => new Error(error));
      })
    ).subscribe({
      complete: () => this.loading = false
    });
  }

  private fetchSensorData() {
    return this.http.get<any>(this.API_URL).pipe(
      tap(res => {
        const resumen = res.resumen;

        const estanqueConDatos = resumen.find((e: any) => e.datos !== null);
        if (!estanqueConDatos) {
          this.error = 'No hay datos disponibles';
          this.loading = false;
          return;
        }

        const datos = estanqueConDatos.datos;
        const timestamp = new Date(estanqueConDatos.fecha);

        this.sensorData = [
          { id: 1, name: 'ph', displayName: 'pH', value: datos.ph, unit: '', timestamp },
          { id: 2, name: 'tempWater', displayName: 'Temperatura del Agua', value: datos.temperaturaAgua, unit: '°C', timestamp },
          { id: 3, name: 'tempAmbient', displayName: 'Temperatura Ambiente', value: datos.temperaturaAmbiente, unit: '°C', timestamp },
          { id: 4, name: 'humidity', displayName: 'Humedad', value: datos.humedad, unit: '%', timestamp },
          { id: 5, name: 'light', displayName: 'Luminosidad', value: datos.luminosidad, unit: 'lux', timestamp },
          { id: 6, name: 'conductivity', displayName: 'Conductividad', value: datos.conductividadElectrica, unit: 'µS/cm', timestamp },
          { id: 7, name: 'co2', displayName: 'CO₂', value: datos.co2, unit: 'ppm', timestamp }
        ];

        this.updateCharts(this.sensorData);
        this.error = null;
        this.loading = false;
      }),
      catchError(error => {
        this.error = 'Error al obtener datos del sensor';
        this.loading = false;
        return throwError(() => new Error(error));
      })
    );
  }

  private initializeCharts(): void {
    const chartConfigs = [
      { id: 'phChart', label: 'pH', color: 'rgba(75, 192, 192, 1)' },
      { id: 'tempWaterChart', label: 'Temperatura del Agua (°C)', color: 'rgba(255, 99, 132, 1)' },
      { id: 'tempAmbientChart', label: 'Temperatura Ambiental (°C)', color: 'rgba(54, 162, 235, 1)' },
      { id: 'humidityChart', label: 'Humedad (%)', color: 'rgba(153, 102, 255, 1)' },
      { id: 'lightChart', label: 'Luminosidad (lux)', color: 'rgba(255, 206, 86, 1)' },
      { id: 'conductivityChart', label: 'Conductividad Eléctrica (µS/cm)', color: 'rgba(255, 159, 64, 1)' },
      { id: 'co2Chart', label: 'CO₂ (ppm)', color: 'rgba(100, 100, 100, 1)' }
    ];

    chartConfigs.forEach(config => {
      const ctx = document.getElementById(config.id) as HTMLCanvasElement;
      if (ctx) {
        const chart = new Chart(ctx, this.getChartConfig(config.label, config.color));
        this.charts.set(config.id, chart);
      }
    });
  }

  private getChartConfig(label: string, borderColor: string): ChartConfiguration {
    return {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label,
          data: [],
          borderColor,
          backgroundColor: borderColor.replace('1)', '0.2)'),
          borderWidth: 2,
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: { y: { beginAtZero: false } },
        plugins: {
          legend: { display: true },
          tooltip: { mode: 'index', intersect: false }
        }
      }
    };
  }

  private updateCharts(data: SensorData[]): void {
    const dataBySensor = data.reduce((acc, item) => {
      if (!acc[item.name]) acc[item.name] = [];
      acc[item.name].push(item);
      return acc;
    }, {} as Record<string, SensorData[]>);

    this.charts.forEach((chart, chartId) => {
      const sensorType = chartId.replace('Chart', '');
      const sensorData = dataBySensor[sensorType] || [];

      if (sensorData.length > 0) {
        chart.data.labels = sensorData.map(d =>
          new Date(d.timestamp).toLocaleTimeString()
        );
        chart.data.datasets[0].data = sensorData.map(d => d.value);
        chart.update();
      }
    });
  }

  private cleanup(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  refreshData() {
    this.loading = true;
    this.fetchSensorData().subscribe();
  }

  shouldDisplaySensor(sensorName: string): boolean {
    return !this.selectedSensorFilter || this.selectedSensorFilter === sensorName;
  }
}
