import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { byDate, CardItem } from '@vocably/model';
import { Subject, takeUntil } from 'rxjs';
import { isDesktop } from '../../../../browser';
import { CardComponent } from '../../card/card.component';
import { DeckStoreService } from '../../deck-store.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  imports: [
    NgIf,
    NgFor,
    CardComponent,
    IonicModule,
    RouterLink,
    TranslocoModule,
  ],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public cardItems: CardItem[] = [];

  public isDesktop = isDesktop;

  constructor(public deckStore: DeckStoreService) {}

  ngOnInit(): void {
    this.deckStore.deck$.pipe(takeUntil(this.destroy$)).subscribe((deck) => {
      this.cardItems = deck.cards.sort(byDate);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
