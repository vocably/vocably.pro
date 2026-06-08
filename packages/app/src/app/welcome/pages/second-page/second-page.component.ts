import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { postOnboardingAction } from '@vocably/api';
import {
  setProxyLanguage,
  setSourceLanguage,
} from '@vocably/extension-messages';
import { GoogleLanguage, isGoogleLanguage, Locale } from '@vocably/model';
import { languageTranslations } from '@vocably/browser-i18n';
import posthog from 'posthog-js';
import {
  catchError,
  filter,
  from,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { extensionId } from '../../../../extension';
import { getFacility } from '../../../getFacility';
import { GenericInstructionComponent } from '../../generic-instruction/generic-instruction.component';
import { HowToVideoComponent } from '../../how-to-video/how-to-video.component';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ContainerService } from '../../container-service';

const getOnboardedTargetLanguages = (): string[] => {
  return JSON.parse(localStorage.getItem('onboardedLanguages') ?? '[]');
};

const isTargetLanguageOnboarded = (targetLanguage: string): boolean => {
  const onboardedLanguages = getOnboardedTargetLanguages();
  return onboardedLanguages.includes(targetLanguage);
};

const onboardTargetLanguage = async (targetLanguage: string) => {
  const onboardedLanguages = getOnboardedTargetLanguages();

  if (onboardedLanguages.includes(targetLanguage)) {
    return;
  }

  const onboardingResult = await postOnboardingAction({
    name: 'facilityOnboarded',
    payload: {
      targetLanguage,
      facility: await getFacility(),
    },
  });

  if (!onboardingResult.success) {
    return;
  }

  localStorage.setItem(
    'onboardedLanguages',
    JSON.stringify([...onboardedLanguages, targetLanguage])
  );
};

@Component({
  selector: 'app-second-page',
  templateUrl: './second-page.component.html',
  styleUrls: ['./second-page.component.scss'],
  imports: [
    NgIf,
    IonicModule,
    HowToVideoComponent,
    MatIcon,
    GenericInstructionComponent,
    TranslocoModule,
  ],
})
export class SecondPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public isLoading = true;
  public exampleHtml = ``;
  public hasNoExample = false;

  public sourceLanguage: GoogleLanguage | undefined = undefined;
  public targetLanguage: GoogleLanguage | undefined = undefined;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transloco: TranslocoService,
    private containerSize: ContainerService
  ) {}

  get studySentenceHtml(): string {
    if (!this.sourceLanguage || !this.targetLanguage) return '';
    const locale = this.transloco.getActiveLang() as Locale;
    const dict = languageTranslations[locale] ?? languageTranslations['en'];
    return this.transloco.translate('welcome.second.study_sentence', {
      sourceLanguage:
        dict[`nominative_${this.sourceLanguage}`] ?? this.sourceLanguage,
      targetLanguage:
        dict[`nominative_${this.targetLanguage}`] ?? this.targetLanguage,
    });
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (params: any) => params['sourceLanguage'] && params['targetLanguage']
        ),
        filter((params) => {
          return (
            isGoogleLanguage(params['sourceLanguage']) &&
            isGoogleLanguage(params['targetLanguage'])
          );
        }),
        tap(() => (this.isLoading = true)),
        tap(async (params) => {
          await setSourceLanguage(extensionId, params['sourceLanguage']);
          await setProxyLanguage(extensionId, params['targetLanguage']);
          this.sourceLanguage = params['sourceLanguage'];
          this.targetLanguage = params['targetLanguage'];

          posthog.capture('$set', {
            $set: {
              studyLanguage: this.sourceLanguage,
              nativeLanguage: this.targetLanguage,
            },
          });
        }),
        tap((params) => {
          if (
            params['targetLanguage'] &&
            !isTargetLanguageOnboarded(params['targetLanguage'])
          ) {
            onboardTargetLanguage(params['targetLanguage']).then();
          }
        }),
        switchMap((params): Observable<string> => {
          const exampleExists = [
            'af',
            'am',
            'ar',
            'az',
            'be',
            'bg',
            'bn',
            'bs',
            'ca',
            'co',
            'cs',
            'cy',
            'da',
            'de',
            'el',
            'en',
            'en-GB',
            'eo',
            'es',
            'et',
            'eu',
            'fa',
            'fi',
            'fr',
            'fy',
            'ga',
            'gd',
            'gl',
            'gu',
            'ha',
            'haw',
            'he',
            'hi',
            'hmn',
            'hr',
            'ht',
            'hu',
            'hy',
            'hyw',
            'id',
            'ig',
            'is',
            'it',
            'ja',
            'jv',
            'ka',
            'kk',
            'km',
            'kn',
            'ko',
            'ku',
            'ky',
            'lb',
            'lo',
            'lt',
            'lv',
            'mg',
            'mi',
            'mk',
            'ml',
            'mn',
            'mr',
            'ms',
            'mt',
            'my',
            'ne',
            'nl',
            'no',
            'ny',
            'or',
            'pa',
            'pl',
            'ps',
            'pt',
            'pt-PT',
            'ro',
            'ru',
            'rw',
            'sd',
            'si',
            'sk',
            'sl',
            'sm',
            'sn',
            'so',
            'sq',
            'sr',
            'st',
            'su',
            'sv',
            'sw',
            'ta',
            'te',
            'tg',
            'th',
            'tk',
            'tl',
            'tr',
            'tt',
            'ug',
            'uk',
            'ur',
            'uz',
            'vi',
            'xh',
            'yi',
            'yo',
            'zh',
            'zh-TW',
            'zu',
          ].includes(params['sourceLanguage']);

          if (!exampleExists) {
            return throwError(() => new Error('No example available'));
          }

          return from(
            fetch(
              `/assets/language-text-examples/${params['sourceLanguage']}.html`
            ).then((res) => {
              if (!res.ok) {
                throw new Error('No example available');
              }
              return res.text();
            })
          );
        }),
        takeUntil(this.destroy$),
        catchError(() => {
          this.hasNoExample = true;
          return of('');
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.exampleHtml = response;
      });

    this.containerSize.size.next('large');
  }

  ngOnDestroy() {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
