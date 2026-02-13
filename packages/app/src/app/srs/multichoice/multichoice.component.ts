import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { sanitizeTranscript } from '@vocably/sulna';
import { FrontComponent } from '../front/front.component';
import { shuffle } from 'lodash-es';
import {
  animate,
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
      state(
        'not-yet',
        style({
          transform: 'scale(1)',
          opacity: '1',
        })
      ),
      state(
        'yes',
        style({
          transform: 'scale(1.5)',
          opacity: '0',
        })
      ),
      transition('* => *', [animate('0.3s')]),
    ]),
  ],
})
export class CardMultichoiceComponent implements OnInit {
  @Input() card!: CardItem;
  @Input() wrongOptions!: CardItem[];
  @Output() grade = new EventEmitter<SrsScore>();

  @Input() reverse: boolean = false;

  correct: 'not-yet' | 'yes' = 'not-yet';

  options: CardItem[];

  wrongfullySelected: CardItem[] = [];

  ngOnInit() {
    this.options = shuffle([this.card, ...this.wrongOptions]);
  }

  protected readonly sanitizeTranscript = sanitizeTranscript;

  onOptionClick = (option: CardItem) => {
    if (this.correct === 'yes') {
      return;
    }

    if (option !== this.card) {
      this.wrongfullySelected.push(option);
      return;
    }

    this.correct = 'yes';
  };

  onCorrectAnimationCompleted = () => {
    if (this.wrongfullySelected.length > 0) {
      this.grade.emit(3);
      return;
    }

    this.grade.emit(5);
  };
}
