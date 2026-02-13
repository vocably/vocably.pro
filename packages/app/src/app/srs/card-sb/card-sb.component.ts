import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SrsScore } from '@vocably/srs';
import { CardComponent } from '../card/card.component';
import { sanitizeTranscript } from '@vocably/sulna';
import { ReverseFrontComponent } from '../reverse-front/reverse-front.component';
import { FrontComponent } from '../front/front.component';

@Component({
  selector: 'app-srs-card-sb',
  imports: [CardComponent, ReverseFrontComponent, FrontComponent],
  templateUrl: './card-sb.component.html',
  styleUrl: './card-sb.component.scss',
})
export class CardSbComponent {
  @Input() card!: CardItem;
  @Output() grade = new EventEmitter<SrsScore>();
  protected readonly sanitizeTranscript = sanitizeTranscript;
}
