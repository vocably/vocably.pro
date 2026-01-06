import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getProxyLanguage,
  setProxyLanguage,
} from '@vocably/extension-messages';
import { GoogleLanguage, sortedTargetLanguages } from '@vocably/model';
import { extensionId } from '../../../../extension';
import { HowToMultilangComponent } from '../../how-to-multilang/how-to-multilang.component';
import { detectTargetLanguage } from './detectTargetLanguage';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
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
    try {
      const proxyLanguage = await getProxyLanguage(extensionId);
      if (proxyLanguage) {
        return proxyLanguage;
      }
    } catch (e) {
      // Firefox doesn't support externally_connectable, ignore error
      console.log('[IndexPage] getProxyLanguage failed (expected in Firefox):', e);
    }

    return detectTargetLanguage();
  }

  onClick(value: GoogleLanguage) {
    this.selected = value;
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
