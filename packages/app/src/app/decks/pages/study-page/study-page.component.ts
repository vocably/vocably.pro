import { Component, OnDestroy, OnInit, resource, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import {
  fetchStudyStreak,
  getUserMetadata,
  getUserStaticMetadata,
  publicPredefinedOptions,
} from '@vocably/api';
import {
  CardItem,
  GoogleLanguage,
  isGoogleLanguage,
  StudyStreak,
} from '@vocably/model';
import {
  craftTheStrategy,
  defaultStudyFlow,
  filterStudyFlow,
  grade,
  slice,
} from '@vocably/srs';
import { finalize, mergeMap, Subject, takeUntil } from 'rxjs';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { GradeResult, ListComponent } from '../../../srs/list/list.component';
import { DeckStoreService } from '../../deck-store.service';
import { DeckService } from '../../deck.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../../components/alert/alert.component';
import { increaseStudyStreak } from '../../../../increaseStudyStreak';
import { dateToString, timeout } from '@vocably/sulna';
import { AuthService } from '../../../auth/auth.service';
import { getStudySettings } from '../../../../study-settings';
import { shuffle } from 'lodash-es';
import { analysisItemToCardItem } from '../../../../analysisItemToCardItem';
import { getLanguageTagStorage } from '../../../../tagsStorage';
import { filterByTags } from '../../../../filterByTags';

@Component({
  selector: 'app-study-page',
  templateUrl: './study-page.component.html',
  styleUrls: ['./study-page.component.scss'],
  imports: [
    ListComponent,
    BackButtonComponent,
    IonicModule,
    MatIconModule,
    TranslocoModule,
  ],
})
export class StudyPageComponent implements OnInit, OnDestroy {
  public cards: CardItem[] = [];
  public total = 0;
  public pendingSaves = signal(0);
  public answered = signal(0);

  public studyStreak: StudyStreak | null = null;

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

      let predefinedCards: CardItem[] = [];

      const translationLanguage =
        userMetadataResult.value.defaultTranslationLanguage ??
        localStorage.getItem('searchTargetLanguage');

      if (
        isGoogleLanguage(translationLanguage) &&
        isGoogleLanguage(this.deckStore.deck$.value.language)
      ) {
        const abortController = new AbortController();
        const predefinedCardsResult = await timeout(
          publicPredefinedOptions(
            this.deckStore.deck$.value.language,
            translationLanguage,
            abortController
          ),
          abortController,
          3000
        );

        if (predefinedCardsResult.success) {
          predefinedCards = predefinedCardsResult.value.map((analysisItem) =>
            analysisItemToCardItem(
              this.deckStore.deck$.value.language as GoogleLanguage,
              analysisItem
            )
          );
        }
      }

      const studySteps = filterStudyFlow(
        userMetadataResult.value.studyFlow ?? defaultStudyFlow,
        (await this.authService.isPaidGroup()) ||
          userStaticMetadataResult.value.premium
      );

      return {
        userMetadata: userMetadataResult.value,
        userStaticMetadata: userStaticMetadataResult.value,
        studySteps,
        predefinedCards,
      };
    },
  });

  allCards: CardItem[] = [];

  constructor(
    private deckStore: DeckStoreService,
    private deckService: DeckService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reloadCards();
  }

  reloadCards() {
    const studySettings = getStudySettings();
    const deck = this.deckStore.deck$.value;

    const tagStorage = getLanguageTagStorage(deck.language);

    this.allCards = filterByTags(deck.cards, tagStorage);

    if (studySettings.random) {
      this.cards = shuffle(this.allCards).slice(
        0,
        studySettings.cardsPerSession
      );
    } else {
      this.cards = slice(
        new Date(),
        studySettings.cardsPerSession,
        studySettings.maxNewCardsPerDay,
        this.allCards
      );
    }

    this.total = this.cards.length;
    this.answered.set(0);
  }

  onGrade(gradeResult: GradeResult) {
    this.answered.update((count) => count + 1);

    if (!this.necessaryData.hasValue()) {
      return;
    }

    const strategy = craftTheStrategy({
      studySteps: this.necessaryData.value().studySteps,
      card: gradeResult.cardItem,
      allCards: this.cards,
      prerenderedCards: this.necessaryData.value().predefinedCards,
    });

    const item = grade(
      gradeResult.cardItem.data,
      gradeResult.score,
      strategy.strategy,
      gradeResult.cardItem.created
    );

    this.pendingSaves.update((count) => count + 1);

    this.deckService
      .update(gradeResult.cardItem.id, item)
      .pipe(
        mergeMap(async (saveResult) => {
          if (saveResult.success === false) {
            this.showSaveError();
            return;
          }

          const today = dateToString(new Date());

          if (!this.studyStreak) {
            const studyStreakResult = await fetchStudyStreak();
            if (studyStreakResult.success) {
              this.studyStreak = studyStreakResult.value;
            }
          }

          if (!this.studyStreak) {
            return;
          }

          if (this.studyStreak.lastStudyDay === today) {
            return;
          }

          const increaseResult = await increaseStudyStreak();
          if (increaseResult.success === false) {
            this.showSaveError();
            return;
          }
          this.studyStreak = increaseResult.value;
        }),
        finalize(() => this.pendingSaves.update((count) => count - 1))
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
