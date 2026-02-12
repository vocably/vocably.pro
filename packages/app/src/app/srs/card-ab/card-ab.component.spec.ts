import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAbComponent } from './card-ab.component';

describe('CardAbComponent', () => {
  let component: CardAbComponent;
  let fixture: ComponentFixture<CardAbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardAbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
