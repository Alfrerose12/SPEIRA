import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CajasPage } from './cajas.page';

describe('CajasPage', () => {
  let component: CajasPage;
  let fixture: ComponentFixture<CajasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CajasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
