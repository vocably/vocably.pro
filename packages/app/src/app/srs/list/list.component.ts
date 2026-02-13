import { animate, style, transition, trigger } from '@angular/animations';
import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem, StudyFlowType } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { Subject } from 'rxjs';
import { GradeComponent } from '../grade/grade.component';
import { SuccessComponent } from '../success/success.component';

export type GradeResult = {
  cardItem: CardItem;
  score: SrsScore;
};

@Component({
  selector: 'app-srs-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('displayComponent', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
  imports: [NgFor, GradeComponent, NgIf, SuccessComponent],
})
export class ListComponent {
  @Input() allCards!: CardItem[];
  @Input() prerenderedCards!: CardItem[];
  @Input() studySteps!: StudyFlowType[];
  @Input() cards!: CardItem[];
  @Input() total = 0;
  @Output() grade = new EventEmitter<GradeResult>();
  @Output() oneMoreRound = new EventEmitter();

  onAnswer(score: SrsScore) {
    this.grade.emit({
      cardItem: this.cards[0],
      score,
    });
    this.cards = this.cards.slice(1);
  }
}
