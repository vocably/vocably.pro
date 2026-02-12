import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMfComponent } from './card-mf.component';

describe('CardMfComponent', () => {
  let component: CardMfComponent;
  let fixture: ComponentFixture<CardMfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMfComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardMfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
