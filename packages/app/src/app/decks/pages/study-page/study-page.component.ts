import { Component, OnDestroy, OnInit, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { getUserMetadata, getUserStaticMetadata } from '@vocably/api';
import { CardItem } from '@vocably/model';
import { defaultStudyFlow, filterStudyFlow, grade, slice } from '@vocably/srs';
import { Subject, takeUntil } from 'rxjs';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { GradeResult, ListComponent } from '../../../srs/list/list.component';
import { DeckStoreService } from '../../deck-store.service';
import { DeckService } from '../../deck.service';

@Component({
  selector: 'app-study-page',
  templateUrl: './study-page.component.html',
  styleUrls: ['./study-page.component.scss'],
  imports: [ListComponent, BackButtonComponent, IonicModule, MatIconModule],
})
export class StudyPageComponent implements OnInit, OnDestroy {
  public cards: CardItem[] = [];

  private destroy$ = new Subject();

  necessaryData = resource({
    loader: async () => {
      const [userMetadataResult, userStaticMetadataResult] = await Promise.all([
        getUserMetadata(),
        getUserStaticMetadata(),
      ]);

      if (userMetadataResult.success === false) {
        throw `Unable to fetch necessary data.`;
      }

      if (userStaticMetadataResult.success === false) {
        throw `Unable to fetch necessary data.`;
      }

      const studySteps = filterStudyFlow(
        userMetadataResult.value.studyFlow ?? defaultStudyFlow,
        userStaticMetadataResult.value.premium
      );

      return {
        userMetadata: userMetadataResult.value,
        userStaticMetadata: userStaticMetadataResult.value,
        studySteps,
      };
    },
  });

  allCards: CardItem[] = [];

  constructor(
    private deckStore: DeckStoreService,
    private deckService: DeckService
  ) {}

  ngOnInit(): void {
    this.reloadCards();
  }

  reloadCards() {
    this.cards = slice(new Date(), 10, this.deckStore.deck$.value.cards);
    this.allCards = this.deckStore.deck$.value.cards;
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
