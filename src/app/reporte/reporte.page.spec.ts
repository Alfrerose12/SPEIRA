import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportePage } from './reporte.page';

describe('ReportePage', () => {
  let component: ReportePage;
  let fixture: ComponentFixture<ReportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
