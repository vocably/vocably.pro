import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import posthog from 'posthog-js';
import { LogoComponent } from '../../header/logo/logo.component';
import { getStats } from '../../stats';
import { shuffle } from 'lodash-es';
import { AutofocusDirective } from './autofocus.directive';

type ReasonId =
  | 'not_often'
  | 'lost_motivation'
  | 'dont_understand'
  | 'translation_quality'
  | 'use_something_else'
  | 'other';

type Reason = {
  id: ReasonId;
  labelKey: string;
  selected: boolean;
  // Reasons that reveal a free-text input when selected.
  withText: boolean;
  placeholderKey?: string;
  text: string;
};

@Component({
  selector: 'app-uninstall',
  templateUrl: './uninstall.component.html',
  styleUrls: ['./uninstall.component.scss'],
  imports: [
    LogoComponent,
    NgIf,
    NgFor,
    FormsModule,
    IonicModule,
    TranslocoModule,
    AutofocusDirective,
  ],
})
export class UninstallComponent implements OnInit {
  public reasons: Reason[] = [];
  public email = '';
  public isSubmitting = false;
  public submitted = false;

  constructor() {}

  ngOnInit(): void {
    const stats = getStats();

    const numberOfDays = stats?.installedDateIso
      ? Math.floor(
          (Date.now() - new Date(stats.installedDateIso).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : undefined;

    posthog.capture('$set', {
      $set: { ...stats, daysBeforeUninstall: numberOfDays },
    });

    const randomReasons: Reason[] = [
      {
        id: 'not_often',
        labelKey: 'uninstall.reason.not_often',
        selected: false,
        withText: false,
        text: '',
      },
      {
        id: 'lost_motivation',
        labelKey: 'uninstall.reason.lost_motivation',
        selected: false,
        withText: false,
        text: '',
      },
      {
        id: 'dont_understand',
        labelKey: 'uninstall.reason.dont_understand',
        selected: false,
        withText: false,
        text: '',
      },
      {
        id: 'translation_quality',
        labelKey: 'uninstall.reason.translation_quality',
        selected: false,
        withText: false,
        text: '',
      },
      {
        id: 'use_something_else',
        labelKey: 'uninstall.reason.use_something_else',
        selected: false,
        withText: true,
        placeholderKey: 'uninstall.use_something_else_placeholder',
        text: '',
      },
    ];

    const other: Reason = {
      id: 'other',
      labelKey: 'uninstall.reason.other',
      selected: false,
      withText: true,
      placeholderKey: 'uninstall.other_placeholder',
      text: '',
    };

    // Every reason but "Other" is shown in a random order. "Other" always stays
    // at the bottom of the list.
    this.reasons = [...shuffle(randomReasons), other];
  }

  public get canSubmit(): boolean {
    return (
      !this.isSubmitting &&
      (this.reasons.some((reason) => reason.selected) ||
        this.email.trim() !== '')
    );
  }

  public submit(): void {
    if (!this.canSubmit) {
      return;
    }

    this.isSubmitting = true;

    const selectedReasons = this.reasons.filter((reason) => reason.selected);

    const properties: Record<string, unknown> = {
      reasons: selectedReasons.map((reason) => reason.id),
    };

    selectedReasons.forEach((reason) => {
      if (reason.withText && reason.text.trim() !== '') {
        properties[`reason_${reason.id}_text`] = reason.text.trim();
      }
    });

    if (this.email.trim() !== '') {
      properties['email'] = this.email.trim();
    }

    posthog.capture('extension_uninstall_survey', properties);

    this.isSubmitting = false;
    this.submitted = true;
  }
}
