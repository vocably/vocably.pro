import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { getLastStudyStreak } from '../../localStudyStreak';
import { dateToString } from '@vocably/sulna';
import { StreakComponent } from '../streak/streak.component';

@Component({
  selector: 'app-srs-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [MatIcon, StreakComponent],
})
export class SuccessComponent implements OnInit {
  @Output() oneMoreRound = new EventEmitter();

  lastStreak = getLastStudyStreak();
  streakAnimationShown = false;

  constructor() {}

  ngOnInit(): void {
    this.lastStreak = getLastStudyStreak();

    const today = dateToString(new Date());
    const lastStreakAnimationShown = localStorage.getItem(
      'streakAnimationShown'
    );
    this.streakAnimationShown = lastStreakAnimationShown === today;
    localStorage.setItem('streakAnimationShown', today);
  }
}
