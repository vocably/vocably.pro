import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardItem, GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import { publicPredefinedOptions } from '@vocably/api';
import {
  getMultiChoice,
  isSuitableForArrangingByLetters,
  SrsScore,
} from '@vocably/srs';
import { MatIcon } from '@angular/material/icon';
import { CardSfComponent } from '../../srs/card-sf/card-sf.component';
import { CardSbComponent } from '../../srs/card-sb/card-sb.component';
import { CardMfComponent } from '../../srs/card-mf/card-mf.component';
import { CardMbComponent } from '../../srs/card-mb/card-mb.component';
import { CardAbComponent } from '../../srs/card-ab/card-ab.component';
import { analysisItemToCardItem } from '../../../analysisItemToCardItem';
import { IonicModule } from '@ionic/angular';

type StepId = 'sf' | 'sb' | 'mf' | 'mb' | 'ab';

const stepLabels: Record<StepId, string> = {
  sf: 'Recall the correct translation',
  sb: 'Recall the correct word or phrase',
  mf: 'Choose the correct translation',
  mb: 'Choose the correct word or phrase',
  ab: 'Arrange the correct word or phrase by letters',
};

@Component({
  selector: 'app-preview-study-step-page',
  templateUrl: './preview-study-step-page.component.html',
  styleUrls: ['./preview-study-step-page.component.scss'],
  imports: [
    RouterLink,
    MatIcon,
    CardSfComponent,
    CardSbComponent,
    CardMfComponent,
    CardMbComponent,
    CardAbComponent,
    IonicModule,
  ],
})
export class PreviewStudyStepPageComponent implements OnInit {
  step: StepId | null = null;
  stepLabel = '';
  card: CardItem | null = null;
  wrongOptions: CardItem[] = [];
  loading = true;
  error: string | null = null;
  completed = false;

  private allCards: CardItem[] = [];

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const step = params['step'] as StepId;
    const sourceLanguage = params['sourceLanguage'];
    const translationLanguage = params['translationLanguage'];

    if (!step || !sourceLanguage || !translationLanguage) {
      this.error = 'Missing required parameters.';
      this.loading = false;
      return;
    }

    if (
      !isGoogleLanguage(sourceLanguage) ||
      !isGoogleLanguage(translationLanguage)
    ) {
      this.error = 'Invalid language parameters.';
      this.loading = false;
      return;
    }

    this.step = step;
    this.stepLabel = stepLabels[step] ?? step;

    const result = await publicPredefinedOptions(
      sourceLanguage,
      translationLanguage
    );

    if (!result.success) {
      this.error = 'Unable to load preview cards.';
      this.loading = false;
      return;
    }

    this.allCards = result.value.map((item) =>
      analysisItemToCardItem(sourceLanguage as GoogleLanguage, item)
    );

    this.selectCard();
    this.loading = false;
  }

  private selectCard() {
    if (!this.step || this.allCards.length === 0) {
      this.error = 'No suitable cards available for preview.';
      return;
    }

    for (const card of this.allCards) {
      if (this.step === 'ab' && !isSuitableForArrangingByLetters(card)) {
        continue;
      }

      if (this.step === 'mf' || this.step === 'mb') {
        const multiChoice = getMultiChoice(card, this.allCards);
        if (!multiChoice) continue;
        this.wrongOptions = multiChoice;
        this.card = card;
        return;
      }

      this.card = card;
      return;
    }

    this.error = 'No suitable cards available for this step type.';
  }

  onGrade(_score: SrsScore) {
    this.completed = true;
  }

  retry() {
    this.completed = false;
  }
}
