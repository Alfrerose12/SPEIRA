import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { IonContent, MenuController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

Chart.register(...registerables);

interface SensorDisplayData {
  displayName: string;
  value: number;
  unit: string;
  key: string; // clave interna para buscar en sensorData
}

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.page.html',
  styleUrls: ['./sensor-monitoring.page.scss'],
  standalone: false,
})
export class SensorMonitoringPage implements AfterViewInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  // Gráficos
  sensorCharts: { [key: string]: Chart } = {};
  
  // Datos históricos para graficar
  sensorData: { [key: string]: number[] } = {
    temperaturaAgua: [],
    temperaturaAmbiente: [],
    ph: [],
    humedad: [],
    luminosidad: [],
    conductividad: [],
    co2: [],
  };

  // Labels de tiempo para el eje X de las gráficas
  labels: string[] = [];

  // Máximo de puntos mostrados
  maxDataPoints = 20;
  refreshInterval = 1000;
  dataSubscription!: Subscription;

  // Para controlar filtro de sensores (segment)
  selectedSensorFilter: string = ''; // cadena vacía significa "todos"
  availableSensors: string[] = [
    'pH',
    'Temperatura del Agua',
    'Temperatura Ambiente',
    'Humedad',
    'Luminosidad',
    'Conductividad',
    'CO₂',
  ];

  // Para mostrar tabla en el ion-grid
  sensorDisplayData: SensorDisplayData[] = [];

  constructor(private apiService: ApiService, private menuCtrl: MenuController) {}

  ngAfterViewInit() {
    this.initCharts();
    this.startDataUpdates();
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  // Inicializar gráficos con Chart.js
  initCharts() {
    // Mapeo entre los nombres visibles y las claves internas
    const sensorMap = {
      'Temperatura del Agua': 'temperaturaAgua',
      'Temperatura Ambiente': 'temperaturaAmbiente',
      'pH': 'ph',
      'Humedad': 'humedad',
      'Luminosidad': 'luminosidad',
      'Conductividad': 'conductividad',
      'CO₂': 'co2',
    };

    Object.entries(sensorMap).forEach(([displayName, key]) => {
      const canvas = document.getElementById(this.getCanvasId(displayName)) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          this.sensorCharts[key] = new Chart(ctx, {
            type: 'line',
            data: {
              labels: this.labels,
              datasets: [{
                label: displayName,
                data: [],
                borderColor: this.getSensorColor(key),
                backgroundColor: 'rgba(0,0,0,0)',
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
                  beginAtZero: false,
                  // Opcional: define rangos si quieres
                }
              },
              plugins: {
                legend: { display: true }
              }
            }
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
        if (this.labels.length > this.maxDataPoints) this.labels.shift();

        // Actualizar datos históricos y tabla
        this.sensorDisplayData = [];

        // Actualizar cada sensor
        Object.keys(this.sensorData).forEach(key => {
          const newValue = data[key] ?? 0;
          this.sensorData[key].push(newValue);
          if (this.sensorData[key].length > this.maxDataPoints) this.sensorData[key].shift();

          // Actualizar tabla de datos (display)
          const displayName = this.getDisplayNameByKey(key);
          const unit = this.getUnitByKey(key);
          this.sensorDisplayData.push({ displayName, value: newValue, unit, key });

          // Actualizar gráfica si existe
          const chart = this.sensorCharts[key];
          if (chart) {
            chart.data.labels = [...this.labels];
            chart.data.datasets[0].data = [...this.sensorData[key]];
            chart.update('none');
          }
        });

        // Mantener máximo puntos en sensorDisplayData
        if (this.sensorDisplayData.length > this.maxDataPoints * Object.keys(this.sensorData).length) {
          this.sensorDisplayData.splice(0, this.sensorDisplayData.length - this.maxDataPoints * Object.keys(this.sensorData).length);
        }
      });
  }

  // Función para abrir menú lateral
  openMenu() {
    this.menuCtrl.open('filter-menu');
  }

  // Filtro para mostrar solo sensores seleccionados o todos
  shouldDisplaySensor(sensorName: string): boolean {
    return this.selectedSensorFilter === '' || this.selectedSensorFilter === sensorName;
  }

  // Helpers
  private getCanvasId(displayName: string): string {
    // Usar nombres en minúsculas y sin espacios para ids de canvas
    return displayName.toLowerCase().replace(/\s+/g, '') + 'Chart';
  }

  private getDisplayNameByKey(key: string): string {
    const map: { [key: string]: string } = {
      temperaturaAgua: 'Temperatura del Agua',
      temperaturaAmbiente: 'Temperatura Ambiente',
      ph: 'pH',
      humedad: 'Humedad',
      luminosidad: 'Luminosidad',
      conductividad: 'Conductividad',
      co2: 'CO₂',
    };
    return map[key] || key;
  }

  private getUnitByKey(key: string): string {
    const units: { [key: string]: string } = {
      temperaturaAgua: '°C',
      temperaturaAmbiente: '°C',
      ph: '',
      humedad: '%',
      luminosidad: 'lux',
      conductividad: 'µS/cm',
      co2: 'ppm',
    };
    return units[key] || '';
  }

  getSensorColor(sensorKey: string): string {
    switch (sensorKey) {
      case 'temperaturaAgua':
      case 'temperaturaAmbiente':
        return 'rgb(255, 99, 132)'; // rojo
      case 'ph':
        return 'rgb(54, 162, 235)'; // azul
      case 'humedad':
        return 'rgb(75, 192, 192)'; // verde azulado
      case 'luminosidad':
        return 'rgb(255, 205, 86)'; // amarillo
      case 'conductividad':
        return 'rgb(153, 102, 255)'; // morado
      case 'co2':
        return 'rgb(255, 159, 64)'; // naranja
      default:
        return 'rgb(201, 203, 207)';
    }
  }
}
