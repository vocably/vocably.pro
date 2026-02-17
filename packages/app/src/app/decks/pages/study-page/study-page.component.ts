import { Component, OnDestroy, OnInit, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { getUserMetadata, getUserStaticMetadata } from '@vocably/api';
import { CardItem } from '@vocably/model';
import {
  craftTheStrategy,
  defaultStudyFlow,
  filterStudyFlow,
  grade,
  slice,
} from '@vocably/srs';
import { Subject, takeUntil, tap } from 'rxjs';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { GradeResult, ListComponent } from '../../../srs/list/list.component';
import { DeckStoreService } from '../../deck-store.service';
import { DeckService } from '../../deck.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../../components/alert/alert.component';
import { increaseStudyStreak } from '../../../../increaseStudyStreak';
import {
  getLastStudyStreak,
  saveLastStudyStreak,
} from '../../../localStudyStreak';
import { dateToString } from '@vocably/sulna';

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
    private deckService: DeckService,
    private dialog: MatDialog
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
      .pipe(
        tap(async (saveResult) => {
          if (saveResult.success === false) {
            this.showSaveError();
            return;
          }

          const today = dateToString(new Date());
          const lastStudyStreak = getLastStudyStreak();

          if (lastStudyStreak.lastStudyDay === today) {
            return;
          }

          const increaseResult = await increaseStudyStreak();
          if (increaseResult.success === false) {
            this.showSaveError();
            return;
          }

          saveLastStudyStreak(increaseResult.value);
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  showSaveError() {
    this.dialog
      .open(AlertComponent, {
        disableClose: true,
        data: {
          message:
            'Something went wrong while saving your progress. Please try again.',
          confirmationButtonLabel: 'Reload this page',
        },
      })
      .afterClosed()
      .subscribe(() => {
        location.reload();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
