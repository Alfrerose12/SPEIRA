import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AjustesAdminPage } from './ajustes-admin.page';

describe('AjustesAdminPage', () => {
  let component: AjustesAdminPage;
  let fixture: ComponentFixture<AjustesAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AjustesAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
