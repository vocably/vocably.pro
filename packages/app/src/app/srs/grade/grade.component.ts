import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardItem, StudyFlowType } from '@vocably/model';
import { craftTheStrategy, ImmediateStep, SrsScore } from '@vocably/srs';
import { CardSfComponent } from '../card-sf/card-sf.component';
import { CardSbComponent } from '../card-sb/card-sb.component';
import { CardMbComponent } from '../card-mb/card-mb.component';
import { CardMfComponent } from '../card-mf/card-mf.component';
import { CardAbComponent } from '../card-ab/card-ab.component';

@Component({
  selector: 'app-srs-grade',
  imports: [
    CardSfComponent,
    CardSbComponent,
    CardMbComponent,
    CardMfComponent,
    CardAbComponent,
  ],
  templateUrl: './grade.component.html',
  styleUrl: './grade.component.scss',
})
export class GradeComponent implements OnInit {
  @Input() allCards!: CardItem[];
  @Input() prerenderedCards!: CardItem[];
  @Input() card!: CardItem;
  @Input() studySteps!: StudyFlowType[];
  @Output() grade = new EventEmitter<SrsScore>();

  step: ImmediateStep;

  ngOnInit(): void {
    this.step = craftTheStrategy({
      studySteps: this.studySteps,
      card: this.card,
      allCards: this.allCards,
      prerenderedCards: this.prerenderedCards,
    }).immediateStep;
  }
}
