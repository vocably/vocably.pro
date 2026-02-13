import { Component, Input } from '@angular/core';
import { CardItem } from '@vocably/model';
import { TextListComponent } from '../text-list/text-list.component';

@Component({
  selector: 'app-srs-reverse-front',
  imports: [TextListComponent],
  templateUrl: './reverse-front.component.html',
  styleUrl: './reverse-front.component.scss',
})
export class ReverseFrontComponent {
  @Input() card!: CardItem;
}
