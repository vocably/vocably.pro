import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getStreakDays, StreakDay } from '@vocably/sulna';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';
import { get } from 'lodash-es';

@Component({
  selector: 'app-streak',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './streak.component.html',
  styleUrl: './streak.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '1000ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('slideOut', [
      transition(':leave', [
        style({
          transform: 'translateY(0)',
          opacity: 1,
        }),
        animate(
          '1000ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ transform: 'translateY(-100%)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('pop', [
      transition(':enter', [
        animate(
          '1000ms',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.2)', offset: 0.5 }),
            style({ transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class StreakComponent implements OnChanges {
  @Input() consecutiveDays: number = 0;
  @Input() hasBeenShown: boolean = false;

  days: StreakDay[] = [];
  showPrevious: boolean = false;
  showCurrent: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consecutiveDays']) {
      this.updateDays();
    }

    // Logic to trigger animation if hasBeenShown is false
    if (changes['consecutiveDays'] || changes['hasBeenShown']) {
      this.handleAnimation();
    }
  }

  private updateDays(): void {
    const country = this.getCountry();
    this.days = getStreakDays(this.consecutiveDays, new Date(), country);
  }

  private handleAnimation(): void {
    if (!this.hasBeenShown) {
      // Setup initial state for animation
      this.showPrevious = true;
      this.showCurrent = false;

      // Trigger animation in next tick
      setTimeout(() => {
        this.showPrevious = false;
        this.showCurrent = true;
      }, 50); // Small delay to ensure initial state is rendered
    } else {
      this.showPrevious = false;
      this.showCurrent = true;
    }
  }

  getCountry(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const parts = navigator.language.split('-');
      return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'US';
    }
    return 'US';
  }

  dayToString(day: number): string {
    const daysMap = {
      0: 'Sun',
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
    };
    return get(daysMap, day, '');
  }

  isLastChecked(index: number): boolean {
    const next = this.days[index + 1];
    return this.days[index].checked && (!next || !next.checked);
  }

  get previousValue(): number {
    return this.consecutiveDays > 0
      ? this.consecutiveDays - 1
      : this.consecutiveDays;
  }

  get currentValue(): number {
    return this.consecutiveDays === 0 ? 1 : this.consecutiveDays;
  }
}
