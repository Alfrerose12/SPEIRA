import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PiscinasPage } from './piscinas.page';

describe('PiscinasPage', () => {
  let component: PiscinasPage;
  let fixture: ComponentFixture<PiscinasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PiscinasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
