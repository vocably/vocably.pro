import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardItem, StudyFlowType } from '@vocably/model';
import { craftTheStrategy, ImmediateStep, SrsScore } from '@vocably/srs';

@Component({
  selector: 'app-srs-grade',
  imports: [],
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
