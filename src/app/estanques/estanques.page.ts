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
    this.apiService.getEstanquesDisponibles().subscribe({
      next: (estanques) => {
        console.log('Estanques disponibles:', estanques);
        this.estanquesDisponibles = estanques;
        if (estanques.length > 0) {
          this.estanqueSeleccionado = estanques[0];
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
        const rawData = response?.resumen?.[0];

        if (!rawData || !rawData.datos) {
          console.warn('No hay datos válidos para el estanque:', this.estanqueSeleccionado);
          return;
        }

        const timestamp = new Date().toISOString();

        const flatData: SensorEntry[] = Object.entries(rawData.datos).map(([key, value]) => {
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
    this.iniciarMonitorEstanque();
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
