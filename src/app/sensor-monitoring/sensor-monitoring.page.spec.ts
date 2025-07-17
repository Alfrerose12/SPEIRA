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
    // Configurar spy para Chart
    spyOn(window, 'Chart').and.callFake(() => new MockChart() as any);

    TestBed.configureTestingModule({
      declarations: [SensorMonitoringPage],
      imports: [
        IonicModule.forRoot(),
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SensorMonitoringPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    
    // Inicializar charts como un Map vacío
    (component as any).charts = new Map();
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
    expect(chartSpy).toHaveBeenCalledTimes(6);
  });

  it('should fetch data on init', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    
    const req = httpMock.expectOne('http://192.168.1.103:3000/api/datos/generales');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
    
    tick(5000);
    expect(component.sensorData.length).toBe(2);
    expect(component.loading).toBeFalse();
  }));

  it('should handle fetch error', fakeAsync(() => {
    component.ngOnInit();
    tick(1000);
    
    const req = httpMock.expectOne('http://192.168.1.103:3000/api/datos/generales');
    req.error(new ErrorEvent('Network error'));
    
    tick(5000);
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  }));

  it('should update charts with new data', () => {
    const mockChart = new MockChart();
    (component as any).charts.set('phChart', mockChart);
    
    // Llamar al método privado
    (component as any).updateCharts([
      { id: 1, name: 'pH', value: 7.2, unit: 'pH', timestamp: new Date('2023-01-01T12:00:00Z') }
    ]);
    
    expect(mockChart.update).toHaveBeenCalled();
    expect(mockChart.data.datasets[0].data).toEqual(jasmine.arrayContaining([7.2]));
  });

  it('should clean up on destroy', () => {
    const mockChart = new MockChart();
    (component as any).charts.set('phChart', mockChart);
    
    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).dataSubscription = mockSubscription;
    
    component.ngOnDestroy();
    
    expect(mockChart.destroy).toHaveBeenCalled();
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    expect((component as any).charts.size).toBe(0);
  });

  it('should refresh data manually', fakeAsync(() => {
    // Crear una implementación falsa del método
    const fetchSpy = spyOn(component as any, 'fetchSensorData').and.returnValue(of(mockData));
    
    component.refreshData();
    expect(fetchSpy).toHaveBeenCalled();
    
    tick();
    expect(component.sensorData.length).toBe(2);
  }));

  it('should update multiple charts correctly', () => {
    // Configurar múltiples mocks
    const phChart = new MockChart();
    const tempChart = new MockChart();
    
    (component as any).charts.set('phChart', phChart);
    (component as any).charts.set('tempWaterChart', tempChart);
    
    // Llamar al método privado
    (component as any).updateCharts([
      { id: 1, name: 'pH', value: 7.2, unit: 'pH', timestamp: new Date('2023-01-01T12:00:00Z') },
      { id: 2, name: 'Temperatura del Agua', value: 25.5, unit: '°C', timestamp: new Date('2023-01-01T12:00:00Z') }
    ]);
    
    expect(phChart.update).toHaveBeenCalled();
    expect(tempChart.update).toHaveBeenCalled();
    expect(phChart.data.datasets[0].data).toEqual(jasmine.arrayContaining([7.2]));
    expect(tempChart.data.datasets[0].data).toEqual(jasmine.arrayContaining([25.5]));
  });
});