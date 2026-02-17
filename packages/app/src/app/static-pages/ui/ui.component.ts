import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardSfComponent } from '../../srs/card-sf/card-sf.component';
import { CardItem } from '@vocably/model';
import { CardSbComponent } from '../../srs/card-sb/card-sb.component';
import { CardMfComponent } from '../../srs/card-mf/card-mf.component';
import { CardMbComponent } from '../../srs/card-mb/card-mb.component';
import { CardAbComponent } from '../../srs/card-ab/card-ab.component';
import { StreakComponent } from '../../srs/streak/streak.component';

@Component({
  selector: 'app-ui',
  imports: [
    CardSfComponent,
    CardSbComponent,
    CardMfComponent,
    CardMbComponent,
    CardAbComponent,
    StreakComponent,
  ],
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
      source:
        'The antique dealer’s eyes widened at the tarnished silver bowl. To the widow selling it, it was a $50 heirloom for rent. To him, the hallmark hidden under the grime signaled a masterwork worth thousands. He looked at her frayed coat and then at his empty ledger. The widow gasped as he wrote a check for the full market value, leaving himself no profit but a clear conscience. He watched her leave, her burden lifted. Integrity, he realized, was the only currency that never devalued.',
      ipa: 'ɪnˈtɛɡrɪti',
      example:
        "* She is known for her integrity.\n* The building's integrity was compromised.\n* The widow gasped as he wrote a check for the full market value, leaving himself no profit but a clear conscience. He watched her leave, her burden lifted. Integrity, he realized, was the only currency that never devalued.",
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

  wrongOptions: CardItem[] = [
    {
      id: 'tuLVu',
      created: 1764155743640,
      data: {
        language: 'en',
        source: 'resilience',
        ipa: 'rɪˈzɪliəns',
        example:
          "* She showed great resilience in the face of adversity.\n* The material's resilience makes it ideal for shock absorption.",
        definition:
          '* The capacity to recover quickly from difficulties; toughness.\n* The ability of a substance or object to spring back into shape; elasticity.',
        translation: 'устойчивость, жизнестойкость, упругость',
        partOfSpeech: 'noun',
        tags: [],
        interval: 0,
        repetition: 0,
        eFactor: 2.5,
        dueDate: 1764115200000,
      },
    },
    {
      id: 'I7RfH',
      created: 1764155743640,
      data: {
        language: 'en',
        source: 'threshold',
        ipa: 'ˈθrɛʃˌhoʊld',
        example:
          '* He stood on the threshold of his career.\n* She paused on the threshold.',
        definition:
          '* The point or level at which something begins or changes\n* A strip of wood, metal, or stone forming the bottom of a doorway and crossed in entering a house or room',
        translation: 'порог, рубеж',
        partOfSpeech: 'noun',
        tags: [],
        interval: 0,
        repetition: 0,
        eFactor: 2.5,
        dueDate: 1764115200000,
      },
    },
    {
      id: '5CjSw',
      created: 1764155743640,
      data: {
        language: 'en',
        source: 'disposition',
        ipa: 'ˌdɪspəˈzɪʃən',
        example:
          '* She has a cheerful disposition.\n* A disposition to avoid conflicts.\n* The disposition of troops.',
        definition:
          "* a person's inherent qualities of mind and character\n* an inclination or tendency of a particular kind\n* the action of arranging or ordering",
        translation: 'расположение, склонность, характер, нрав',
        partOfSpeech: 'noun',
        tags: [],
        interval: 0,
        repetition: 0,
        eFactor: 2.5,
        dueDate: 1764115200000,
      },
    },
  ];
}
