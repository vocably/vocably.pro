import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { CardComponent } from '../card/card.component';
import { TextListComponent } from '../text-list/text-list.component';
import { sanitizeTranscript } from '@vocably/sulna';
import { FrontComponent } from '../front/front.component';

@Component({
  selector: 'app-srs-card-sf',
  imports: [CardComponent, TextListComponent, FrontComponent],
  templateUrl: './card-sf.component.html',
  styleUrl: './card-sf.component.scss',
})
export class CardSfComponent {
  @Input() card!: CardItem;
  @Output() grade = new EventEmitter<SrsScore>();
  protected readonly sanitizeTranscript = sanitizeTranscript;
}
