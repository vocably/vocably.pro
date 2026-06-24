import { Component, Input } from '@angular/core';
import { CardItem } from '@vocably/model';
import { sanitizeTranscript } from '@vocably/sulna';
import { TextListComponent } from '../text-list/text-list.component';
import { PlaySoundComponent } from '../../components/play-sound/play-sound.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-srs-front',
  imports: [TextListComponent, PlaySoundComponent, TranslocoPipe],
  templateUrl: './front.component.html',
  styleUrl: './front.component.scss',
})
export class FrontComponent {
  @Input() card!: CardItem;
  protected readonly sanitizeTranscript = sanitizeTranscript;
}
