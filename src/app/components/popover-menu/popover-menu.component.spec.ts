import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PopoverMenuComponent } from './popover-menu.component';

describe('PopoverMenuComponent', () => {
  let component: PopoverMenuComponent;
  let fixture: ComponentFixture<PopoverMenuComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PopoverMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
