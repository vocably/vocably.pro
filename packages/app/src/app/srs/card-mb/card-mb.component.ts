import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { CardMultichoiceComponent } from '../multichoice/multichoice.component';

@Component({
  selector: 'app-srs-card-mb',
  imports: [CardMultichoiceComponent],
  templateUrl: './card-mb.component.html',
  styleUrl: './card-mb.component.scss',
})
export class CardMbComponent {
  @Input() card!: CardItem;
  @Input() wrongOptions!: CardItem[];
  @Output() grade = new EventEmitter<SrsScore>();
}
