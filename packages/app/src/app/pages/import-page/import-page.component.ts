import { Component, OnDestroy, OnInit } from '@angular/core';

import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import * as Sentry from '@sentry/browser';
import {
  deleteTag,
  listLanguages,
  loadLanguageDeck,
  updateTag,
} from '@vocably/api';
import { getSourceLanguage } from '@vocably/extension-messages';
import {
  GoogleLanguage,
  isTagItem,
  languageList,
  NewTag,
  TagItem,
} from '@vocably/model';
import { isString } from 'lodash-es';
import posthog from 'posthog-js';
import {
  combineLatest,
  finalize,
  firstValueFrom,
  ReplaySubject,
  Subject,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { filter } from 'rxjs/operators';
import { extensionId } from '../../../extension';
import { DeckSelectorComponent } from '../../components/deck-selector/deck-selector.component';
import { LanguageInputComponent } from '../../components/language-input/language-input.component';
import { HeaderComponent } from '../../header/header.component';
import { columnLabels } from '../../importExport';
import { isExtensionInstalled$ } from '../../isExtensionInstalled';
import { TagsSelectorComponent } from '../../tags/tags-selector/tags-selector.component';
import { bulkAnalyzeSources } from './bulkAnalyzeSources';
import { csvToArray } from './csvToArray';
import { CsvData, getCsvData } from './getCsvData';
import { getExtraCsvColumns, SafeColumn } from './getExtraCsvColumns';
import { ImportFailureDialogComponent } from './import-failure-dialog/import-failure-dialog.component';
import {
  ImportSuccessDialogComponent,
  ImportSuccessDialogData,
} from './import-success-dialog/import-success-dialog.component';
import { importCsv } from './importCsv';

const detectImportDeck = async (): Promise<GoogleLanguage | ''> => {
  const isExtensionInstalled = await firstValueFrom(
    isExtensionInstalled$.pipe()
  );

  if (isExtensionInstalled) {
    const extensionSourceLanguage = await getSourceLanguage(extensionId);
    if (extensionSourceLanguage) {
      return extensionSourceLanguage;
    }
  }

  const result = await listLanguages();

  if (result.success === false) {
    return '';
  }

  if (result.value.length === 1) {
    return result.value[0] as GoogleLanguage;
  }

  return '';
};

@Component({
  selector: 'app-import-page',
  templateUrl: './import-page.component.html',
  styleUrls: ['./import-page.component.scss'],
  imports: [
    HeaderComponent,
    NgIf,
    IonicModule,
    LanguageInputComponent,
    DeckSelectorComponent,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    FormsModule,
    NgFor,
    TagsSelectorComponent,
    MatChipSet,
    MatChip,
    MatChipRemove,
    AsyncPipe,
    TranslocoModule,
  ],
})
export class ImportPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public loadingDecks = true;
  public selectedDeck$ = new ReplaySubject<GoogleLanguage | 'none'>();
  public loadingSelectedDeck = false;
  public deck$ = this.selectedDeck$.pipe(
    tap(() => {
      this.loadingSelectedDeck = true;
    }),
    switchMap(async (selectedDeck) => {
      if (!selectedDeck) {
        return null;
      }

      const deckResult = await loadLanguageDeck(selectedDeck);

      if (deckResult.success === false) {
        return null;
      }

      return deckResult.value;
    }),
    tap(() => (this.loadingSelectedDeck = false)),
    takeUntil(this.destroy$)
  );

  public selectedTags: Array<NewTag | TagItem> = [];
  public newTags: NewTag[] = [];
  public deckTags: TagItem[] = [];

  get allTags(): Array<TagItem | NewTag> {
    return [...this.newTags, ...this.deckTags];
  }

  public csv: string = '';
  public csvData$ = new ReplaySubject<CsvData>();
  public csvPos: string[] = [];
  public extraCsvColumns: SafeColumn[] = [];
  public columnLabels = columnLabels;

  public languages = Object.keys(languageList) as GoogleLanguage[];
  public isAnalyzing = false;

  public isImporting = false;

  constructor(public dialog: MatDialog) {}

  async ngOnInit() {
    this.loadingDecks = true;
    this.selectedDeck$.next((await detectImportDeck()) || 'none');
    this.loadingDecks = false;

    this.deck$.pipe(takeUntil(this.destroy$)).subscribe((deck) => {
      this.selectedTags = this.selectedTags.filter((t) => !isTagItem(t));
      this.deckTags = deck ? deck.tags : [];
    });

    combineLatest([this.selectedDeck$, this.csvData$])
      .pipe(
        tap(([_, csvData]) => {
          this.csvPos = [];
          csvData.forEach((dataItem, index) => {
            if (dataItem.partOfSpeech) {
              this.csvPos[index] = dataItem.partOfSpeech;
            }
          });

          this.extraCsvColumns = getExtraCsvColumns(csvData);
        }),
        filter(([selectedDeck]) => selectedDeck !== 'none'),
        switchMap(([selectedDeck, csvData]) => {
          this.isAnalyzing = true;
          posthog.capture('csv_analyze_started');
          return bulkAnalyzeSources(
            selectedDeck === 'none' ? 'en' : selectedDeck,
            csvData
              .filter((csvData) => !csvData.partOfSpeech)
              .map((d) => d.source)
          ).pipe(
            finalize(() => {
              posthog.capture('csv_analyze_ended');
              this.isAnalyzing = false;
            })
          );
        }),
        withLatestFrom(this.csvData$),
        takeUntil(this.destroy$)
      )
      .subscribe(([result, csvData]) => {
        csvData.forEach(
          ({ source, partOfSpeech: originalPartOfSpeech }, index) => {
            if (this.csvPos[index]) {
              return;
            }

            if (!result[source]) {
              return;
            }

            if (originalPartOfSpeech) {
              return;
            }

            this.csvPos[index] = result[source];
          }
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onFileChange(filesInput: EventTarget | null) {
    if (!filesInput || !(filesInput instanceof HTMLInputElement)) {
      return;
    }

    if (!filesInput.files || filesInput.files.length === 0) {
      return;
    }

    const file = filesInput.files.item(0);
    if (file === null) {
      return;
    }

    let reader: FileReader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      this.csv = reader.result as string;
      this.onCsvChange();
    };
  }

  onCsvChange() {
    posthog.capture('csv_loaded', {
      length: this.csv.length,
    });

    if (this.csv.trim() === '') {
      this.csvData$.next([]);
      return;
    }

    const csvData = getCsvData(csvToArray(this.csv, '\t'));

    posthog.capture('csv_data_parsed', {
      records: csvData.length,
      csvData: csvData.length === 0 ? this.csv : 'not needed',
    });

    this.csvData$.next(csvData);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textArea = event.currentTarget as HTMLTextAreaElement;
      textArea.setRangeText(
        '\t',
        textArea.selectionStart,
        textArea.selectionEnd,
        'end'
      );
    }
  }

  selectTag(tag: TagItem | NewTag) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
      return;
    }

    this.selectedTags = [...this.selectedTags, tag];
  }

  async addNewTag(tag: NewTag) {
    this.newTags.unshift(tag);
    this.selectedTags.push(tag);
  }

  async saveTag(language: string, tag: TagItem | NewTag) {
    if (!isTagItem(tag)) {
      return;
    }

    const updateResult = await updateTag(language, tag);

    if (!updateResult.success) {
      return;
    }

    this.deckTags = updateResult.value.tags;
  }

  async deleteTag(language: string, tag: TagItem | NewTag) {
    if (isTagItem(tag)) {
      const deleteResult = await deleteTag(language, tag.id);
      if (deleteResult.success) {
        this.deckTags = deleteResult.value.tags;
        this.selectedTags = this.selectedTags.filter(
          (t) => !isTagItem(t) || t.id !== tag.id
        );
      }
      return;
    }

    this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    this.newTags = this.newTags.filter((t) => t !== tag);
  }

  async import(language: GoogleLanguage, csvData: CsvData) {
    if (this.isImporting) {
      return;
    }

    this.isImporting = true;

    const importResult = await importCsv({
      language,
      csvCards: csvData
        .map((csvData, index) => ({
          ...csvData,
          partOfSpeech: this.csvPos[index],
        }))
        .filter((c) => isString(c.partOfSpeech)),
      tags: this.selectedTags,
    });

    this.isImporting = false;

    if (importResult.success === false) {
      this.dialog.open(ImportFailureDialogComponent);
      posthog.capture('import_failure', {
        reason: importResult.reason,
      });
      Sentry.captureMessage('Import failure', {
        extra: {
          ...importResult,
        },
      });
      return;
    }

    this.dialog
      .open<ImportSuccessDialogComponent, ImportSuccessDialogData>(
        ImportSuccessDialogComponent,
        {
          data: {
            language,
          },
        }
      )
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value === 'import-more') {
          this.csv = '';
          this.csvData$.next([]);
          this.selectedTags = [];
        }
      });
  }
}
