import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { ReverseFrontComponent } from '../reverse-front/reverse-front.component';
import { shuffle } from 'lodash-es';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-srs-card-ab',
  imports: [ReverseFrontComponent],
  templateUrl: './card-ab.component.html',
  styleUrl: './card-ab.component.scss',
  animations: [
    trigger('shake', [
      transition('false => true', [
        animate(
          '400ms ease-in-out',
          keyframes([
            style({ transform: 'translateX(0)', offset: 0 }),
            style({ transform: 'translateX(-10px)', offset: 0.2 }),
            style({ transform: 'translateX(10px)', offset: 0.4 }),
            style({ transform: 'translateX(-10px)', offset: 0.6 }),
            style({ transform: 'translateX(10px)', offset: 0.8 }),
            style({ transform: 'translateX(0)', offset: 1.0 }),
          ])
        ),
      ]),
    ]),
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
export class CardAbComponent implements OnInit {
  @Input() card!: CardItem;
  @Output() grade = new EventEmitter<SrsScore>();

  correctAnswer: string = '';
  letters: string[] = [];
  answer: Array<number | false> = [];

  answerDisplayed = false;
  wrong = false;
  correct = false;

  hadErrors = false;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      for (
        let letterIndex = this.answer.length - 1;
        letterIndex >= 0;
        letterIndex--
      ) {
        if (this.answer[letterIndex] !== false) {
          this.unuseLetter(letterIndex);
          break;
        }
      }
      return;
    }

    const key = event.key.toUpperCase();

    for (
      let letterIndex = 0;
      letterIndex < this.letters.length;
      letterIndex++
    ) {
      if (this.letters[letterIndex].toUpperCase() !== key) {
        continue;
      }

      if (!this.answer.includes(letterIndex)) {
        this.useLetter(letterIndex);
        break;
      }
    }
  }

  ngOnInit() {
    this.correctAnswer = this.card.data.source.toUpperCase();
    this.letters = shuffle(this.correctAnswer.split(''));
    this.answer = this.letters.map(() => false);
  }

  checkAnswer() {
    const answerString = this.answer
      .map((letterIndex) =>
        letterIndex !== false ? this.letters[letterIndex] : ''
      )
      .join('');
    if (answerString === this.correctAnswer) {
      this.correct = true;
    } else {
      this.wrong = true;
      this.hadErrors = true;
    }
  }

  useLetter(index: number) {
    for (let i = 0; i < this.answer.length; i++) {
      if (this.answer[i] === false) {
        this.answer[i] = index;
        break;
      }
    }

    if (this.answer.every((letterIndex) => letterIndex !== false)) {
      this.checkAnswer();
    }
  }

  unuseLetter(index: number) {
    this.answer[index] = false;
    this.wrong = false;
  }

  onCorrectAnimationCompleted = () => {
    this.grade.emit(this.hadErrors || this.answerDisplayed ? 3 : 5);
  };
}
