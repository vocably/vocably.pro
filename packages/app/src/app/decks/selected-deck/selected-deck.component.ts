import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { loadLanguageDeck } from '@vocably/api';
import { GoogleLanguage } from '@vocably/model';
import {
  combineLatest,
  filter,
  from,
  map,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { RouterParamsService } from '../../router-params.service';
import { DeckListStoreService } from '../deck-list-store.service';
import { DeckStoreService } from '../deck-store.service';

@Component({
  selector: 'app-selected-deck',
  templateUrl: './selected-deck.component.html',
  styleUrls: ['./selected-deck.component.scss'],
  standalone: false,
})
export class SelectedDeckComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public isLoading = true;
  public language: GoogleLanguage | '' = '';
  cleanScreen = false;
  title = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public deckListStore: DeckListStoreService,
    public deckStore: DeckStoreService,
    routerParams: RouterParamsService
  ) {
    routerParams.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.cleanScreen = data['cleanScreen'] ?? false;
      this.title = data['title'] ?? '';
    });

    combineLatest([this.deckListStore.decks$, this.route.params])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([decks, params]) => {
        if (!decks.includes(params['language'])) {
          this.router.navigate(['../'], {
            relativeTo: this.route,
            replaceUrl: true,
          });
        }
      });

    this.deckListStore.decks$.pipe(takeUntil(this.destroy$));

    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        withLatestFrom(this.route.params),
        map(([_, params]) => params['language']),
        filter((language) =>
          this.deckListStore.decks$.value.includes(language)
        ),
        tap(() => (this.isLoading = true)),
        tap((language) => {
          this.language = language;
        }),
        switchMap((language) => from(loadLanguageDeck(language)))
      )
      .subscribe((result) => {
        this.isLoading = false;
        if (result.success === false) {
          throw new Error(result.reason);
        }
        this.deckStore.store(result.value);
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  changeLanguage(language: string) {
    this.router.navigate(['deck', language]);
  }
}
