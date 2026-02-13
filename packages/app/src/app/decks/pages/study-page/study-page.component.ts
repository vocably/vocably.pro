import { Component, OnDestroy, OnInit, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { getUserMetadata, getUserStaticMetadata } from '@vocably/api';
import { CardItem, StudyStrategy } from '@vocably/model';
import {
  craftTheStrategy,
  defaultStudyFlow,
  filterStudyFlow,
  grade,
  slice,
} from '@vocably/srs';
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
  public total = 0;

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
    this.allCards = this.deckStore.deck$.value.cards;
    this.cards = slice(new Date(), 10, this.deckStore.deck$.value.cards);
    this.total = this.cards.length;
  }

  onGrade(gradeResult: GradeResult) {
    if (!this.necessaryData.hasValue()) {
      return;
    }

    const strategy = craftTheStrategy({
      studySteps: this.necessaryData.value().studySteps,
      card: gradeResult.cardItem,
      allCards: this.cards,
      prerenderedCards: [],
    });

    const item = grade(
      gradeResult.cardItem.data,
      gradeResult.score,
      strategy.strategy
    );

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
