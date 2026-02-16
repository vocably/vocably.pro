import {
  animate,
  animateChild,
  keyframes,
  state,
  style,
  transition,
  trigger,
  group,
  query,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { CardItem } from '@vocably/model';
import { TextLengthDirective } from '../text-length.directive';
import { SrsScore } from '@vocably/srs';
import { MatTooltip } from '@angular/material/tooltip';

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
        '5',
        style({
          transform: 'translate(100vw, 0px)',
        })
      ),
      state(
        '3',
        style({
          transform: 'translate(0px, 100vh)',
        })
      ),
      state(
        '1',
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
          transform: 'scale(1.2)',
          opacity: '1',
        })
      ),
      transition('* => *', [animate('0.2s')]),
    ]),
    trigger('hide', [
      state('true', style({ transform: 'scale(1.5)', opacity: '0' })),
      transition('false => true', [
        group([
          // Parent animation
          animate(
            '0.5s',
            keyframes([
              style({ transform: 'scale(1)', opacity: '1', offset: 0 }),
              style({ transform: 'scale(1.5)', opacity: '0', offset: 1 }),
            ])
          ),
          // Force child animations to run simultaneously
          query('@card, @operation', [animateChild()], { optional: true }),
        ]),
      ]),
    ]),
  ],
  imports: [TextLengthDirective, MatIcon, MatTooltip],
})
export class CardComponent {
  @Input() card!: CardItem;
  @Output() grade = new EventEmitter<SrsScore>();
  @Output() flip = new EventEmitter<boolean>();

  @HostListener('document:keydown.space', ['$event'])
  onSpace(event: KeyboardEvent) {
    event.preventDefault();
    this.onFlip();
  }

  @HostListener('document:keydown.arrowLeft', ['$event'])
  onArrowLeft() {
    this.userAnswer = 1;
  }

  @HostListener('document:keydown.arrowRight', ['$event'])
  arrowRight() {
    this.userAnswer = 5;
  }

  @HostListener('document:keydown.arrowDown', ['$event'])
  arrowDown() {
    this.userAnswer = 3;
  }

  public isFlipped = false;

  public userAnswer: SrsScore | 'unknown' = 'unknown';

  constructor() {}

  onHideAnimationCompleted() {
    if (this.userAnswer !== 'unknown') {
      this.grade.emit(this.userAnswer);
    }
  }

  public onFlip() {
    this.isFlipped = !this.isFlipped;
    this.flip.emit(this.isFlipped);
  }
}
