import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-card-sb',
  imports: [CardComponent],
  templateUrl: './card-sb.component.html',
  styleUrl: './card-sb.component.scss',
})
export class CardSbComponent {
  @Input() card!: CardItem;
  @Output() grade = new EventEmitter<SrsScore>();
}
