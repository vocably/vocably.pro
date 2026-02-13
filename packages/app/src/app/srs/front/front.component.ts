import { Component, Input } from '@angular/core';
import { CardItem } from '@vocably/model';
import { sanitizeTranscript } from '@vocably/sulna';
import { TextListComponent } from '../text-list/text-list.component';

@Component({
  selector: 'app-srs-front',
  imports: [TextListComponent],
  templateUrl: './front.component.html',
  styleUrl: './front.component.scss',
})
export class FrontComponent {
  @Input() card!: CardItem;
  protected readonly sanitizeTranscript = sanitizeTranscript;
}
