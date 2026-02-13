import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { CardComponent } from '../card/card.component';
import { sanitizeTranscript } from '@vocably/sulna';
import { TextListComponent } from '../text-list/text-list.component';

@Component({
  selector: 'app-card-sb',
  imports: [CardComponent, TextListComponent],
  templateUrl: './card-sb.component.html',
  styleUrl: './card-sb.component.scss',
})
export class CardSbComponent {
  @Input() card!: CardItem;
  @Output() grade = new EventEmitter<SrsScore>();
  protected readonly sanitizeTranscript = sanitizeTranscript;
}
