import { Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { StudyFlowType } from '@vocably/model';
import { defaultStudyFlow } from '@vocably/srs';
import {
  getUserMetadata,
  saveUserMetadata,
  listLanguages,
  getUserStaticMetadata,
} from '@vocably/api';
import { AuthService } from '../../../auth/auth.service';

const stepLabelKeys: Record<string, string> = {
  mf: 'settings.study_steps.mf',
  sf: 'settings.study_steps.sf',
  mb: 'settings.study_steps.mb',
  ab: 'settings.study_steps.ab',
  sb: 'settings.study_steps.sb',
};

@Component({
  selector: 'app-study-steps',
  templateUrl: './study-steps.component.html',
  styleUrls: ['./study-steps.component.scss'],
  imports: [CdkDropList, CdkDrag, MatSlideToggle, MatIcon, TranslocoModule],
})
export class StudyStepsComponent implements OnInit {
  steps: StudyFlowType[] = [];
  loaded = false;
  sourceLanguage: string | null = null;
  translationLanguage: string | null = null;
  authService = inject(AuthService);
  transloco = inject(TranslocoService);

  isPaid = false;

  async ngOnInit() {
    const [metadataResult, staticMetadataResult, languagesResult] =
      await Promise.all([
        getUserMetadata(),
        getUserStaticMetadata(),
        listLanguages(),
      ]);

    if (!metadataResult.success) return;
    if (!staticMetadataResult.success) return;
    if (!languagesResult.success) return;

    this.translationLanguage =
      metadataResult.value.defaultTranslationLanguage ?? null;

    if (languagesResult.value.length > 0) {
      this.sourceLanguage = languagesResult.value[0];
    }

    if (!this.sourceLanguage || !this.translationLanguage) return;

    this.isPaid =
      (await this.authService.isPaidGroup()) ||
      staticMetadataResult.value.premium;

    this.steps = (metadataResult.value.studyFlow ?? [...defaultStudyFlow]).map(
      (step) => {
        if (this.isPaid) {
          return step;
        }

        if (step.id !== 'ab') {
          return step;
        }

        return {
          ...step,
          enabled: false,
        };
      }
    );

    this.loaded = true;
  }

  getLabel(id: string): string {
    const key = stepLabelKeys[id];
    return key ? this.transloco.translate(key) : id;
  }

  getPreviewUrl(step: StudyFlowType): string {
    return `/settings/preview-study-step?step=${step.id}&sourceLanguage=${this.sourceLanguage}&translationLanguage=${this.translationLanguage}`;
  }

  async onToggle(index: number) {
    this.steps[index] = {
      ...this.steps[index],
      enabled: !this.steps[index].enabled,
    } as StudyFlowType;
    await saveUserMetadata({ studyFlow: this.steps });
  }

  async onDrop(event: CdkDragDrop<StudyFlowType[]>) {
    const moved = this.steps.splice(event.previousIndex, 1)[0];
    this.steps.splice(event.currentIndex, 0, moved);
    await saveUserMetadata({ studyFlow: this.steps });
  }
}
