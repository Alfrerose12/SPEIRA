import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EstanquesPage } from './estanques.page';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

describe('EstanquesPage', () => {
  let component: EstanquesPage;
  let fixture: ComponentFixture<EstanquesPage>;

  beforeEach(waitForAsync(() => {
    // Mock simple para Chart, casteado a any para evitar errores TS
    spyOn(window, 'Chart').and.callFake(() => ({
      destroy: () => {},
      update: () => {},
      data: {
        labels: [] as string[],
        datasets: [{ data: [] as number[] }]
      }
    }) as any);

    TestBed.configureTestingModule({
      declarations: [EstanquesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ nombre: 'Estanque1' })
          }
        },
        {
          provide: ApiService,
          useValue: {
            getSensorDataByEstanque: (nombre: string) =>
              of({ ph: [7.1, 7.2], tempWater: [25.3, 25.5] })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EstanquesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sensor data and initialize charts', () => {
    const phData = component.sensorData.filter(s => s.key === 'ph');
    const tempWaterData = component.sensorData.filter(s => s.key === 'tempWater');
  
    expect(phData.length).toBeGreaterThan(0);
    expect(tempWaterData.length).toBeGreaterThan(0);
  });

  it('should update chart data when updateCharts is called', () => {
    const mockChart = {
      destroy: jasmine.createSpy('destroy'),
      update: jasmine.createSpy('update'),
      data: {
        labels: [] as string[],
        datasets: [{ data: [] as number[] }]
      }
    };
    component.sensorCharts['phChart'] = mockChart as any;
    component.sensorData = {
      ph: [6.9, 7.0, 7.1]
    } as any;

    component.updateCharts();

    expect(mockChart.update).toHaveBeenCalled();
    expect(mockChart.data.datasets[0].data).toContain(7.1);
  });

  it('should destroy charts and unsubscribe on destroy', () => {
    const mockChart = {
      destroy: jasmine.createSpy('destroy'),
      update: jasmine.createSpy('update'),
      data: {
        labels: [] as string[],
        datasets: [{ data: [] as number[] }]
      }
    };
    const mockSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);

    component.sensorCharts['phChart'] = mockChart as any;
    component.dataSubscription = mockSub;

    component.ngOnDestroy();

    expect(mockChart.destroy).toHaveBeenCalled();
    expect(mockSub.unsubscribe).toHaveBeenCalled();
  });
});
