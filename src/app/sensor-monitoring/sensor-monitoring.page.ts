import { Component, ViewChild, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { IonContent, MenuController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

Chart.register(...registerables);

interface Sensor {
  key: string;
  displayName: string;
  unit: string;
  chartId: string;
  range?: { min: number; max: number };
}

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false
})
export class SensorMonitoringPage implements AfterViewInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChildren('scrollWrapper') scrollWrappers!: QueryList<ElementRef>;

  sensors: Sensor[] = [
    { key: 'ph', displayName: 'pH', unit: '', chartId: 'phChart', range: { min: 9, max: 11 } },
    { key: 'tempWater', displayName: 'Temperatura del Agua', unit: '°C', chartId: 'tempWaterChart', range: { min: 30, max: 35 } },
    { key: 'tempAmbient', displayName: 'Temperatura Ambiente', unit: '°C', chartId: 'tempAmbientChart', range: { min: 20, max: 40 } },
    { key: 'humidity', displayName: 'Humedad', unit: '%', chartId: 'humidityChart', range: { min: 40, max: 70 } },
    { key: 'luminosity', displayName: 'Luminosidad', unit: 'lux', chartId: 'lightChart', range: { min: 35, max: 690 } },
    { key: 'conductivity', displayName: 'Conductividad', unit: 'µS/cm', chartId: 'conductivityChart' },
    { key: 'co2', displayName: 'CO₂', unit: 'ppm', chartId: 'co2Chart' },
  ];

  sensorData: { displayName: string; value: number; unit: string }[] = [];
  sensorCharts: { [key: string]: Chart } = {};
  sensorHistory: { [key: string]: number[] } = {};

  labels: string[] = [];
  maxDataPoints = 20;
  refreshInterval = 1000;
  dataSubscription!: Subscription;

  selectedSensorFilter: string = '';
  availableSensors = this.sensors.map(s => s.key);

  autoScroll = true;

  constructor(private apiService: ApiService, private menuCtrl: MenuController) {}

  ngAfterViewInit() {
    this.initCharts();
    this.startDataUpdates();
  }

  ngOnDestroy() {
    this.dataSubscription?.unsubscribe();
  }

  initCharts() {
    this.sensors.forEach(sensor => {
      const canvas = document.getElementById(sensor.chartId) as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.sensorCharts[sensor.key] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [{
            label: sensor.displayName,
            data: [],
            borderColor: this.getSensorColor(sensor.key),
            backgroundColor: 'rgba(0, 0, 0, 0)',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          animation: false,
          scales: {
            y: {
              min: sensor.range?.min,
              max: sensor.range?.max,
            }
          },
          plugins: {
            legend: { display: true }
          }
        }
      });
      this.sensorHistory[sensor.key] = [];
    });
  }

  startDataUpdates() {
    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => this.apiService.getSensorGeneralData())
    ).subscribe(data => {
      const now = new Date().toLocaleTimeString();
      this.labels.push(now);
      if (this.labels.length > this.maxDataPoints) this.labels.shift();

      this.sensorData = this.sensors.map(sensor => ({
        displayName: sensor.displayName,
        value: data[sensor.key],
        unit: sensor.unit
      }));

      this.sensors.forEach(sensor => {
        const val = data[sensor.key];
        this.sensorHistory[sensor.key].push(val);
        if (this.sensorHistory[sensor.key].length > this.maxDataPoints)
          this.sensorHistory[sensor.key].shift();

        const chart = this.sensorCharts[sensor.key];
        if (chart) {
          chart.data.labels = [...this.labels];
          chart.data.datasets[0].data = [...this.sensorHistory[sensor.key]];
          chart.update('none');
        }
      });

      if (this.autoScroll) {
        setTimeout(() => {
          this.scrollWrappers.forEach(el => {
            const nativeEl = el.nativeElement as HTMLElement;
            nativeEl.scrollLeft = nativeEl.scrollWidth;
          });
        }, 50);
      }
    });
  }

  getSensorColor(sensorKey: string): string {
    switch (sensorKey) {
      case 'tempWater': return 'rgb(255, 99, 132)';
      case 'ph': return 'rgb(54, 162, 235)';
      case 'tempAmbient': return 'rgb(75, 192, 192)';
      case 'humidity': return 'rgb(255, 205, 86)';
      case 'luminosity': return 'rgb(201, 203, 207)';
      case 'conductivity': return 'rgb(150, 150, 150)';
      case 'co2': return 'rgb(100, 100, 255)';
      default: return 'rgb(0,0,0)';
    }
  }

  openMenu() {
    this.menuCtrl.open('filter-menu');
  }

  shouldDisplaySensor(displayName: string): boolean {
    if (!this.selectedSensorFilter) return true;
    const filterSensor = this.sensors.find(s => s.key === this.selectedSensorFilter);
    if (!filterSensor) return true;
    return filterSensor.displayName === displayName;
  }

  toggleAutoScroll() {
    this.autoScroll = !this.autoScroll;
  }
}
