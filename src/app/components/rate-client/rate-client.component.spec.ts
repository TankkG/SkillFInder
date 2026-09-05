import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateClientComponent } from './rate-client.component';

describe('RateClientComponent', () => {
  let component: RateClientComponent;
  let fixture: ComponentFixture<RateClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
