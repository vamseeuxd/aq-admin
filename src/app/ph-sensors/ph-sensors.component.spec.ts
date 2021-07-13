import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PHSensorsComponent } from './ph-sensors.component';

describe('PHSensorsComponent', () => {
  let component: PHSensorsComponent;
  let fixture: ComponentFixture<PHSensorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PHSensorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PHSensorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
