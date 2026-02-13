import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardSfComponent } from '../../srs/card-sf/card-sf.component';
import { CardItem } from '@vocably/model';
import { CardSbComponent } from '../../srs/card-sb/card-sb.component';

@Component({
  selector: 'app-ui',
  imports: [CardSfComponent, CardSbComponent],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.scss',
})
export class UiComponent {
  private route = inject(ActivatedRoute);
  componentName = this.route.snapshot.paramMap.get('component');

  card: CardItem = {
    id: 'Fc0Tg',
    created: 1764155743640,
    data: {
      language: 'en',
      source: 'integrity',
      ipa: 'ɪnˈtɛɡrɪti',
      example:
        "* She is known for her integrity.\n* The building's integrity was compromised.",
      definition:
        '* adherence to moral and ethical principles; soundness of moral character\n* the state of being whole, entire, or undiminished',
      translation: 'честность, целостность',
      partOfSpeech: 'noun',
      tags: [],
      interval: 0,
      repetition: 0,
      eFactor: 2.5,
      dueDate: 1764115200000,
    },
  };
}
