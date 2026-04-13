import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { CardItem, languageList } from '@vocably/model';
import { cardsToCsv } from '@vocably/model-operations';
import { get } from 'lodash-es';
import { Subject, takeUntil } from 'rxjs';
import { LoaderService } from '../../../components/loader.service';
import { DeckStoreService } from '../../deck-store.service';
import { LexicalaExplanationDialogComponent } from './lexicala-explanation-dialog/lexicala-explanation-dialog.component';

@Component({
  selector: 'app-export-page',
  templateUrl: './export-page.component.html',
  styleUrls: ['./export-page.component.scss'],
  imports: [
    MatRadioGroup,
    ReactiveFormsModule,
    FormsModule,
    MatRadioButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    NgIf,
    TranslocoModule,
  ],
})
export class ExportPageComponent implements OnInit, OnDestroy {
  public cards: CardItem[] = [];

  public colDelimiter = 'tab';
  public customColDelimiter = '-';
  public rowDelimiter = 'new_line';
  public customRowDelimiter = '\\n\\n';

  public fileName = '';

  public languageName: string = '';
  public hasLexicalaItems = false;

  private destroy$ = new Subject();

  constructor(
    public deckStore: DeckStoreService,
    public loader: LoaderService,
    protected sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
    this.deckStore.deck$.pipe(takeUntil(this.destroy$)).subscribe((deck) => {
      this.cards = deck.cards;

      const csvData = cardsToCsv({
        cards: this.cards,
        language: deck.language,
      });

      this.hasLexicalaItems = csvData.lexicalaSkipped;
      this.languageName = get(languageList, deck.language, 'this language');

      this.fileName = `${deck.language}`;
      if (this.cards.length > 0) {
        const lastCreateDate = new Date(this.cards[0].created);
        this.fileName += `-${lastCreateDate.getFullYear()}-${(
          lastCreateDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${lastCreateDate
          .getDate()
          .toString()
          .padStart(2, '0')}`;
      }
      this.fileName += '.csv';
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  copyToClipboard(textArea: HTMLTextAreaElement): void {
    textArea.select();
    navigator.clipboard.writeText(textArea.value).then();
  }

  getContents(): string {
    const colDelimiter =
      this.colDelimiter === 'tab'
        ? `\t`
        : this.colDelimiter === 'comma'
          ? ','
          : this.customColDelimiter;

    const rowDelimiter =
      this.rowDelimiter === 'new_line'
        ? `\n`
        : this.rowDelimiter === 'semicolon'
          ? ';'
          : this.customRowDelimiter.replace(/\\n/g, `\n`);

    const result = cardsToCsv({
      cards: this.cards,
      language: this.deckStore.deck$.value.language,
      colDelimiter,
      rowDelimiter,
    });

    return result.csv;
  }

  getContentsLink = (textContents: string): any => {
    const blob = new Blob([textContents], { type: 'text/csv' });
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  };

  whyCantExportLexicala() {
    const dialogRef = this.dialog.open(LexicalaExplanationDialogComponent);
  }
}
