import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { random } from 'lodash-es';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { dateToString } from '@vocably/sulna';
import { StreakComponent } from '../streak/streak.component';
import { StudyStreak } from '@vocably/model';

const MOTIVATIONAL_QUOTE_COUNT = 28;
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-srs-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [MatIcon, StreakComponent, TranslocoModule, RouterLink],
})
export class SuccessComponent implements OnInit {
  @Input() studyStreak!: StudyStreak | null;
  @Input() hasCardsLeftForToday = false;
  @Output() oneMoreRound = new EventEmitter();

  streakAnimationShown = false;
  quoteIndex = random(MOTIVATIONAL_QUOTE_COUNT - 1);

  constructor() {}

  ngOnInit(): void {
    if (!this.studyStreak) {
      return;
    }

    const today = dateToString(new Date());
    const lastStreakAnimationShown = localStorage.getItem(
      'streakAnimationShown'
    );
    this.streakAnimationShown = lastStreakAnimationShown === today;
    localStorage.setItem('streakAnimationShown', today);
  }
}
