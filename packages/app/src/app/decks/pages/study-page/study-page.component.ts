import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardItem } from '@vocably/model';
import { grade, slice } from '@vocably/srs';
import { Subject, takeUntil } from 'rxjs';
import { GradeResult } from '../../../srs/list/list.component';
import { DeckStoreService } from '../../deck-store.service';
import { DeckService } from '../../deck.service';

@Component({
  selector: 'app-study-page',
  templateUrl: './study-page.component.html',
  styleUrls: ['./study-page.component.scss'],
  standalone: false,
})
export class StudyPageComponent implements OnInit, OnDestroy {
  public cards: CardItem[] = [];

  private destroy$ = new Subject();

  constructor(
    private deckStore: DeckStoreService,
    private deckService: DeckService
  ) {}

  ngOnInit(): void {
    this.reloadCards();
  }

  reloadCards() {
    this.cards = slice(new Date(), 10, this.deckStore.deck$.value.cards);
  }

  onGrade(gradeResult: GradeResult) {
    // Keep the current state because web app does not support strategies yet
    const currentState = gradeResult.cardItem.data.state;
    const item = grade(gradeResult.cardItem.data, gradeResult.score, [
      {
        step: 'sf',
        allowedFailures: null,
      },
    ]);
    if (currentState) {
      item.state = currentState;
    }

    this.deckService
      .update(gradeResult.cardItem.id, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
