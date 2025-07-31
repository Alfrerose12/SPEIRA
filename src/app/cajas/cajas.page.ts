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
  selector: 'app-cajas',
  templateUrl: './cajas.page.html',
  styleUrls: ['./cajas.page.scss'],
  standalone: false
})
export class CajasPage implements OnInit, OnDestroy, AfterViewInit {

  cajasDisponibles: string[] = [];
  cajaSeleccionada: string = '';

  sensorData: SensorEntry[] = [];
  dataSubscription!: Subscription;
  refreshInterval = 1000;
  sensorCharts: { [key: string]: Chart } = {};

  selectedSensorFilter: string = '';

  availableSensors = [
    { key: 'ph', name: 'pH', unit: 'pH', canvasId: 'phChart', color: '#4caf50' },
    { key: 'tempWater', name: 'Temperatura del agua', unit: '°C', canvasId: 'tempWaterChart', color: '#2196f3' },
    { key: 'tempAmbient', name: 'Temperatura ambiente', unit: '°C', canvasId: 'tempAmbientChart', color: '#f44336' },
    { key: 'humidity', name: 'Humedad', unit: '%', canvasId: 'humidityChart', color: '#ff9800' },
    { key: 'luminosity', name: 'Luminosidad', unit: 'lux', canvasId: 'lightChart', color: '#9c27b0' },
    { key: 'conductivity', name: 'Conductividad eléctrica', unit: 'µS/cm', canvasId: 'conductivityChart', color: '#3f51b5' },
    { key: 'co2', name: 'CO₂', unit: 'ppm', canvasId: 'co2Chart', color: '#009688' }
  ];

  constructor(private apiService: ApiService, private menuCtrl: MenuController) {}

  ngOnInit() {
    this.apiService.getCajasDisponibles().subscribe({
      next: (cajas: { nombre: string }[]) => {
        if (cajas.length > 0) {
          this.cajasDisponibles = cajas.map(c => c.nombre);
          this.cajaSeleccionada = this.cajasDisponibles[0];
          this.iniciarMonitorCaja();
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
          ? this.apiService.getCajaData(this.cajaSeleccionada)
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
          const lastValid = [...datos].reverse().find(d => typeof d[sensor.key] !== 'undefined' && d[sensor.key] !== null);
          return {
            id: 0,
            name: sensor.name,
            value: lastValid ? Number(lastValid[sensor.key]) : 0,
            unit: sensor.unit,
            timestamp: lastValid ? lastValid.timestamp : new Date().toISOString(),
            key: sensor.key
          };
        });

        this.sensorData = flatData;
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
    this.iniciarMonitorCaja();
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

  shouldDisplaySensor(key: string): boolean {
    return this.selectedSensorFilter === '' || this.selectedSensorFilter === key;
  }

  openMenu() {
    this.menuCtrl.open('filter-menu');
  }
}
