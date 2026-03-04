import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getProxyLanguage,
  setProxyLanguage,
} from '@vocably/extension-messages';
import { GoogleLanguage, sortedTargetLanguages } from '@vocably/model';
import { extensionId } from '../../../../extension';
import { isFirefox } from '../../../../firefox';
import { LanguageIconComponent } from '../../../components/language-icon/language-icon.component';
import { LanguageInputComponent } from '../../../components/language-input/language-input.component';
import { LanguagePipe } from '../../../language/language.pipe';
import { HowToMultilangComponent } from '../../how-to-multilang/how-to-multilang.component';
import { LanguageButtonComponent } from '../../language-button/language-button.component';
import { detectTargetLanguage } from './detectTargetLanguage';
import { saveUserMetadata } from '@vocably/api';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
  imports: [
    NgIf,
    LanguageInputComponent,
    NgFor,
    LanguageButtonComponent,
    LanguageIconComponent,
    MatIcon,
    LanguagePipe,
  ],
})
export class IndexPageComponent implements OnInit {
  languages = sortedTargetLanguages;
  showTop = 12;
  expanded = false;
  targetLanguage: GoogleLanguage | undefined;
  selected: GoogleLanguage | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.targetLanguage = await this.getInitialLanguageInputValue();
  }

  private async getInitialLanguageInputValue(): Promise<GoogleLanguage> {
    const proxyLanguage = isFirefox
      ? null
      : await getProxyLanguage(extensionId);

    if (proxyLanguage) {
      return proxyLanguage;
    }

    return detectTargetLanguage();
  }

  onClick(value: GoogleLanguage) {
    this.selected = value;

    if (this.targetLanguage) {
      saveUserMetadata({
        defaultTranslationLanguage: this.targetLanguage,
      });
    }

    this.router
      .navigate([`./${value}/${this.targetLanguage}`], {
        relativeTo: this.activatedRoute,
      })
      .then();
  }

  showHowToMultilang() {
    this.dialog.open(HowToMultilangComponent);
  }

  async saveProxyLanguage(language: GoogleLanguage) {
    await setProxyLanguage(extensionId, language);
  }
}
