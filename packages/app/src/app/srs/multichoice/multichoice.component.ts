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
import { sanitizeTranscript } from '@vocably/sulna';
import { FrontComponent } from '../front/front.component';
import { shuffle } from 'lodash-es';
import { ReverseFrontComponent } from '../reverse-front/reverse-front.component';
import { hideAnimation } from '../hide-animation';

@Component({
  selector: 'app-srs-multichoice',
  imports: [FrontComponent, ReverseFrontComponent],
  templateUrl: './multichoice.component.html',
  styleUrl: './multichoice.component.scss',
  animations: [hideAnimation],
  host: {
    '[@hide]': 'correct',
    '(@hide.done)': 'onHideAnimationCompleted()',
  },
})
export class CardMultichoiceComponent implements OnInit {
  @Input() card!: CardItem;
  @Input() wrongOptions!: CardItem[];
  @Output() grade = new EventEmitter<SrsScore>();

  @Input() reverse: boolean = false;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (
      !this.options
        .map((_, index) => (index + 1).toString())
        .includes(event.key)
    ) {
      return;
    }

    event.preventDefault();
    const index = parseInt(event.key) - 1;

    this.onOptionClick(this.options[index]);
  }

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

  onHideAnimationCompleted = () => {
    if (!this.correct) {
      return;
    }

    if (this.wrongfullySelected.length > 0) {
      this.grade.emit(3);
      return;
    }

    this.grade.emit(5);
  };
}
