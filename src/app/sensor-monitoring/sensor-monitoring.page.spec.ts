import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SensorMonitoringPage } from './sensor-monitoring.page';
import { of } from 'rxjs';

class MockChart {
  destroy() {}
  update() {}
  data = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[]
    }]
  };
}

describe('SensorMonitoringPage', () => {
  let component: SensorMonitoringPage;
  let fixture: ComponentFixture<SensorMonitoringPage>;
  let httpMock: HttpTestingController;

  const mockData = [
    { id: 1, name: 'pH', value: 7.2, unit: 'pH', timestamp: '2023-01-01T12:00:00Z' },
    { id: 2, name: 'Temperatura', value: 25.5, unit: '°C', timestamp: '2023-01-01T12:00:00Z' }
  ];

  beforeEach(waitForAsync(() => {
    spyOn(window, 'Chart').and.callFake(() => new MockChart() as any);

    TestBed.configureTestingModule({
      declarations: [SensorMonitoringPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: 'ApiService',
          useValue: {
            getSensorGeneralData: () => of({ resumen: [{ datos: { ph: 7.1, temperaturaAgua: 25.5 } }] })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SensorMonitoringPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    (component as any).sensorCharts = new Map();
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create charts during initialization', () => {
    const chartSpy = spyOn(window, 'Chart');
    component.ngAfterViewInit();
    expect(chartSpy).toHaveBeenCalledTimes(component.availableSensors.length);
  });

  it('should update charts with new data', () => {
    const mockChart = new MockChart();
    (component as any).sensorCharts['phChart'] = mockChart;

    component.sensorData = [
      { id: 1, name: 'pH', value: 7.2, unit: 'pH', timestamp: new Date('2023-01-01T12:00:00Z').toISOString(), key: 'ph' }
    ];

    component.updateCharts();

    expect(mockChart.update).toHaveBeenCalled();
    expect(mockChart.data.datasets[0].data).toEqual(jasmine.arrayContaining([7.2]));
  });

  it('should clean up on destroy', () => {
    const mockChart = new MockChart();
    (component as any).sensorCharts['phChart'] = mockChart;

    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component.dataSubscription = mockSubscription;

    component.ngOnDestroy();

    expect(mockChart.destroy).toHaveBeenCalled();
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect(Object.keys(component.sensorCharts).length).toBe(0);
  });

  it('should update multiple charts correctly', () => {
    const phChart = new MockChart();
    const tempChart = new MockChart();

    (component as any).sensorCharts['phChart'] = phChart;
    (component as any).sensorCharts['tempWaterChart'] = tempChart;

    component.sensorData = [
      { id: 1, name: 'pH', value: 7.2, unit: 'pH', timestamp: new Date('2023-01-01T12:00:00Z').toISOString(), key: 'ph' },
      { id: 2, name: 'Temperatura del agua', value: 25.5, unit: '°C', timestamp: new Date('2023-01-01T12:00:00Z').toISOString(), key: 'tempWater' }
    ];

    component.updateCharts();

    expect(phChart.update).toHaveBeenCalled();
    expect(tempChart.update).toHaveBeenCalled();
    expect(phChart.data.datasets[0].data).toEqual(jasmine.arrayContaining([7.2]));
    expect(tempChart.data.datasets[0].data).toEqual(jasmine.arrayContaining([25.5]));
  });
});
