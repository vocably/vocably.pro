import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { CardMultichoiceComponent } from '../multichoice/multichoice.component';

@Component({
  selector: 'app-srs-card-mf',
  imports: [CardMultichoiceComponent],
  templateUrl: './card-mf.component.html',
  styleUrl: './card-mf.component.scss',
})
export class CardMfComponent {
  @Input() card!: CardItem;
  @Input() wrongOptions!: CardItem[];
  @Output() grade = new EventEmitter<SrsScore>();
}
