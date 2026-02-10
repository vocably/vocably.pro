import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CardItem } from '@vocably/model';
import { Subject, takeUntil } from 'rxjs';
import { SideBComponent } from '../side-b/side-b.component';
import { TextLengthDirective } from '../text-length.directive';

type Point = {
  x: number;
  y: number;
};

const getTouchPagePoint = (e: TouchEvent): Point => ({
  x: e.touches[0].pageX,
  y: e.touches[0].pageY,
});

const fixedState = window.innerWidth / 4;

export type Answer = 'strong' | 'weak' | 'somewhat';

@Component({
  selector: 'app-srs-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [
    trigger('card', [
      state(
        'unknown',
        style({
          transform: 'translate(0px, 0px)',
        })
      ),
      state(
        'strong',
        style({
          transform: 'translate(100vw, 0px)',
        })
      ),
      state(
        'somewhat',
        style({
          transform: 'translate(0px, 100vh)',
        })
      ),
      state(
        'weak',
        style({
          transform: 'translate(-100vw, 0px)',
        })
      ),
      transition('* => *', [animate('0.4s')]),
    ]),
    trigger('operation', [
      state(
        'unknown',
        style({
          transform: 'scale(0)',
          opacity: '0',
        })
      ),
      state(
        'known',
        style({
          transform: 'scale(1)',
          opacity: '1',
        })
      ),
      transition('* => *', [animate('0.3s')]),
    ]),
  ],
  imports: [TextLengthDirective, NgIf, SideBComponent, MatIcon],
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() item!: CardItem;
  @Input() flip$!: Subject<unknown>;
  @Input() answer$!: Subject<Answer>;
  @Output() answer = new EventEmitter<Answer>();

  public isFlipped = false;

  public displaceX = 0;
  public displaceY = 0;
  public toFixedState = 0;

  public isMoveDirectionDetected = false;
  public isHorizontalMovement = false;

  public userAnswer: 'unknown' | Answer = 'unknown';

  private touchStartPoint: Point = {
    x: 0,
    y: 0,
  };
  private touchStartTime = 0;

  private destroy$ = new Subject();

  constructor() {}

  ngOnInit(): void {
    this.flip$.pipe(takeUntil(this.destroy$)).subscribe(() => this.flip());
    this.answer$
      .pipe(takeUntil(this.destroy$))
      .subscribe((answer) => (this.userAnswer = answer));
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onTouchStart(e: TouchEvent) {
    this.touchStartPoint = getTouchPagePoint(e);
    this.touchStartTime = Date.now();
  }

  onTouchMove(e: TouchEvent) {
    e.preventDefault();

    const currentPoint = getTouchPagePoint(e);
    const xDelta = currentPoint.x - this.touchStartPoint.x;
    const yDelta = currentPoint.y - this.touchStartPoint.y;

    if (!this.isMoveDirectionDetected) {
      this.isHorizontalMovement = Math.abs(xDelta) > yDelta;
      this.isMoveDirectionDetected = true;
    }

    if (this.isHorizontalMovement) {
      this.displaceX = xDelta;
      this.toFixedState =
        fixedState < Math.abs(xDelta) ? 1 : Math.abs(xDelta) / fixedState;
      return;
    }

    if (yDelta > 0) {
      this.displaceY = yDelta;
      this.toFixedState = fixedState < yDelta ? 1 : yDelta / fixedState;
    }
  }

  onTouchEnd() {
    if (
      !this.isMoveDirectionDetected &&
      Date.now() - this.touchStartTime <= 300
    ) {
      this.isFlipped = !this.isFlipped;
      return;
    }

    if (!this.isHorizontalMovement && this.displaceY > fixedState) {
      this.answer.emit('somewhat');
      return;
    } else if (this.isHorizontalMovement && this.displaceX > fixedState) {
      this.answer.emit('strong');
      return;
    } else if (this.isHorizontalMovement && this.displaceX < -fixedState) {
      this.answer.emit('weak');
      return;
    }

    this.displaceX = 0;
    this.displaceY = 0;
    this.isMoveDirectionDetected = false;
    this.toFixedState = 0;
  }

  onSelectionAnimationCompleted() {
    if (this.userAnswer !== 'unknown') {
      this.answer.emit(this.userAnswer);
    }
  }

  public flip() {
    this.isFlipped = !this.isFlipped;
  }
}
