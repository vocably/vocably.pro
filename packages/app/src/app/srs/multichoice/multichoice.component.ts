import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { sanitizeTranscript } from '@vocably/sulna';
import { FrontComponent } from '../front/front.component';
import { shuffle } from 'lodash-es';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ReverseFrontComponent } from '../reverse-front/reverse-front.component';

@Component({
  selector: 'app-srs-multichoice',
  imports: [FrontComponent, ReverseFrontComponent],
  templateUrl: './multichoice.component.html',
  styleUrl: './multichoice.component.scss',
  animations: [
    trigger('correct', [
      state('true', style({ transform: 'scale(1.5)', opacity: '0' })),
      transition('false => true', [
        animate(
          '0.3s',
          keyframes([
            style({ transform: 'scale(1)', opacity: '1' }),
            style({ transform: 'scale(1.5)', opacity: '0' }),
          ])
        ),
      ]),
    ]),
  ],
})
export class CardMultichoiceComponent implements OnInit {
  @Input() card!: CardItem;
  @Input() wrongOptions!: CardItem[];
  @Output() grade = new EventEmitter<SrsScore>();

  @Input() reverse: boolean = false;

  correct: boolean = false;

  options: CardItem[];

  wrongfullySelected: CardItem[] = [];

  ngOnInit() {
    this.options = shuffle([this.card, ...this.wrongOptions]);
  }

  protected readonly sanitizeTranscript = sanitizeTranscript;

  onOptionClick = (option: CardItem) => {
    if (this.correct) {
      return;
    }

    if (option !== this.card) {
      this.wrongfullySelected.push(option);
      return;
    }

    this.correct = true;
  };

  onCorrectAnimationCompleted = () => {
    if (this.wrongfullySelected.length > 0) {
      this.grade.emit(3);
      return;
    }

    this.grade.emit(5);
  };
}
