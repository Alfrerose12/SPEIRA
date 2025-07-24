import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false,
})
export class SensorMonitoringPage implements AfterViewInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  sensorCharts: { [key: string]: Chart } = {};
  sensorData: { [key: string]: number[] } = {
    temperatura: [],
    ph: [],
    humedad: [],
    luminosidad: [],
  };
  sensorRanges: { [key: string]: { min: number; max: number } } = {
    temperatura: { min: 30, max: 35 },
    ph: { min: 9, max: 11 },
    humedad: { min: 40, max: 70 },
    luminosidad: { min: 35, max: 690 },
  };

  labels: string[] = [];
  maxDataPoints: number = 20;
  refreshInterval = 1000;
  dataSubscription!: Subscription;

  constructor(private apiService: ApiService) {}

  ngAfterViewInit() {
    this.initCharts();
    this.startDataUpdates();
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  initCharts() {
    Object.keys(this.sensorData).forEach(sensor => {
      const canvas = document.getElementById(`${sensor}-chart`) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.sensorCharts[sensor] = new Chart(ctx, {
            type: 'line',
            data: {
              labels: this.labels,
              datasets: [
                {
                  label: sensor.toUpperCase(),
                  data: [],
                  borderColor: this.getSensorColor(sensor),
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  tension: 0.3,
                  pointRadius: 0,
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              animation: false,
              scales: {
                y: {
                  min: this.sensorRanges[sensor].min,
                  max: this.sensorRanges[sensor].max,
                },
              },
              plugins: {
                legend: {
                  display: true,
                },
              },
            },
          });
        }
      }
    });
  }

  startDataUpdates() {
    this.dataSubscription = interval(this.refreshInterval)
      .pipe(switchMap(() => this.apiService.getSensorGeneralData()))
      .subscribe((data: any) => {
        const now = new Date().toLocaleTimeString();
        this.labels.push(now);
        if (this.labels.length > this.maxDataPoints) {
          this.labels.shift();
        }

        Object.keys(this.sensorData).forEach(sensor => {
          const newValue = data[sensor];
          this.sensorData[sensor].push(newValue);
          if (this.sensorData[sensor].length > this.maxDataPoints) {
            this.sensorData[sensor].shift();
          }

          const chart = this.sensorCharts[sensor];
          if (chart) {
            chart.data.labels = [...this.labels];
            chart.data.datasets[0].data = [...this.sensorData[sensor]];
            chart.update('none');
          }
        });
      });
  }

  getSensorColor(sensor: string): string {
    switch (sensor) {
      case 'temperatura':
        return 'rgb(255, 99, 132)';
      case 'ph':
        return 'rgb(54, 162, 235)';
      case 'humedad':
        return 'rgb(75, 192, 192)';
      case 'luminosidad':
        return 'rgb(255, 205, 86)';
      default:
        return 'rgb(201, 203, 207)';
    }
  }
}
