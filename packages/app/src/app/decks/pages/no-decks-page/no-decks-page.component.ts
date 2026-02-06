import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DeckListStoreService } from '../../deck-list-store.service';

@Component({
  selector: 'app-no-decks-page',
  templateUrl: './no-decks-page.component.html',
  styleUrls: ['./no-decks-page.component.scss'],
  standalone: false,
})
export class NoDecksPageComponent implements OnInit {
  constructor(
    deckListStore: DeckListStoreService,
    router: Router,
    route: ActivatedRoute
  ) {
    if (deckListStore.decks$.value.length > 0) {
      router.navigate([deckListStore.decks$.value[0]], {
        relativeTo: route,
        replaceUrl: true,
      });
    } else {
      router.navigate(['/welcome'], { replaceUrl: true });
    }
  }

  ngOnInit(): void {}
}
