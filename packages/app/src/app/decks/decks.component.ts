import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { listLanguages } from '@vocably/api';
import { GoogleLanguage } from '@vocably/model';
import {
  from,
  merge,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { RefreshService } from '../refresh.service';
import { DeckListStoreService } from './deck-list-store.service';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  imports: [NgIf, IonicModule, RouterOutlet],
})
export class DecksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  isLoading = true;

  constructor(
    decksListStore: DeckListStoreService,
    refreshService: RefreshService
  ) {
    merge(decksListStore.reload$, refreshService.refresh$)
      .pipe(
        takeUntil(this.destroy$),
        startWith(null),
        tap(() => refreshService.register('decks-list')),
        tap(() => {
          this.isLoading = true;
        }),
        switchMap(() => from(listLanguages()))
      )
      .subscribe({
        next: (result) => {
          refreshService.unregister('decks-list');
          this.isLoading = false;
          if (!result.success) {
            throw new Error((result as any).reason);
          }
          decksListStore.store(result.value as GoogleLanguage[]);
        },
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
