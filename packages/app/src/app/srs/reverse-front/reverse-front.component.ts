import { Component, Input } from '@angular/core';
import { CardItem } from '@vocably/model';
import { TextListComponent } from '../text-list/text-list.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-srs-reverse-front',
  imports: [TextListComponent, TranslocoModule],
  templateUrl: './reverse-front.component.html',
  styleUrl: './reverse-front.component.scss',
})
export class ReverseFrontComponent {
  @Input() card!: CardItem;
  @Input() expectedAction = 'srs.reverse_front.guess_the';
}
