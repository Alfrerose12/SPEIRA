import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false
})
export class SensorMonitoringPage implements OnInit, OnDestroy {
  sensorData: any = {};
  dataSubscription!: Subscription;
  refreshInterval = 1000; // cada segundo
  sensorCharts: {
    [key: string]: Chart<keyof ChartTypeRegistry, (number | [number, number] | import('chart.js').Point | import('chart.js').BubbleDataPoint | null)[], unknown>;
  } = {};

  availableSensors = [
    { key: 'ph', name: 'pH', unit: 'pH' },
    { key: 'tempWater', name: 'Temperatura del agua', unit: '°C' },
    { key: 'tempAmb', name: 'Temperatura ambiente', unit: '°C' },
    { key: 'oxigen', name: 'Oxígeno disuelto', unit: 'mg/L' }
  ];

  selectedSensorKeys: string[] = ['ph', 'tempWater', 'tempAmb', 'oxigen'];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.dataSubscription = interval(this.refreshInterval).pipe(
      switchMap(() => this.apiService.getSensorGeneralData())
    ).subscribe(data => {
      console.log('DATA:', data);
      this.sensorData = data;
      this.updateCharts();
    });
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  get filteredSensors() {
    return this.availableSensors.filter(sensor => this.selectedSensorKeys.includes(sensor.key));
  }

  updateCharts() {
    this.filteredSensors.forEach(sensor => {
      const key = sensor.key;
      const value = this.sensorData[key];

      if (this.sensorCharts[key]) {
        const chart = this.sensorCharts[key];
        const chartData = chart.data.datasets[0].data as number[];

        chartData.push(value);
        if (chartData.length > 10) {
          chartData.shift();
        }

        chart.update();
      }
    });
  }

  createChart(canvasId: string, label: string, color: string) {
    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;

    this.sensorCharts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(10).fill(''),
        datasets: [{
          label,
          data: [],
          borderColor: color,
          backgroundColor: color,
          fill: false,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: {
            display: false
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  isSelected(sensorKey: string): boolean {
    return this.selectedSensorKeys.includes(sensorKey);
  }

  toggleSensor(sensorKey: string) {
    if (this.isSelected(sensorKey)) {
      this.selectedSensorKeys = this.selectedSensorKeys.filter(key => key !== sensorKey);
    } else {
      this.selectedSensorKeys.push(sensorKey);
    }
  }
}
