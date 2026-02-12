import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMbComponent } from './card-mb.component';

describe('CardMbComponent', () => {
  let component: CardMbComponent;
  let fixture: ComponentFixture<CardMbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMbComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardMbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
