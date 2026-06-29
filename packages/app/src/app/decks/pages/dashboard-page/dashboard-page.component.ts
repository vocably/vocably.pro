import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { byDate, CardItem, TagItem } from '@vocably/model';
import { BehaviorSubject, combineLatest, Subject, takeUntil } from 'rxjs';
import { isDesktop } from '../../../../browser';
import { CardComponent } from '../../card/card.component';
import { DeckStoreService } from '../../deck-store.service';
import {
  getLanguageTagStorage,
  setLanguageTagStorage,
} from '../../../../tagsStorage';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { TagsDropdownComponent } from '../../../tags/tags-dropdown/tags-dropdown.component';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  imports: [
    NgIf,
    NgFor,
    CardComponent,
    IonicModule,
    RouterLink,
    TranslocoModule,
    MatIcon,
    MatChipSet,
    MatChip,
    MatChipRemove,
    TagsDropdownComponent,
  ],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  @ViewChild(TagsDropdownComponent) tagsDropdown?: TagsDropdownComponent;

  public tags: TagItem[] = [];

  public allCards$ = new BehaviorSubject<CardItem[]>([]);
  public selectedTags$ = new BehaviorSubject<TagItem[]>([]);
  public noTags$ = new BehaviorSubject<boolean>(false);

  public cardItems: CardItem[] = [];

  public isDesktop = isDesktop;

  private language = '';

  constructor(public deckStore: DeckStoreService) {}

  ngOnInit(): void {
    this.deckStore.deck$.pipe(takeUntil(this.destroy$)).subscribe((deck) => {
      this.allCards$.next(deck.cards.sort(byDate));
      this.tags = deck.tags;
      this.language = deck.language;

      const storage = getLanguageTagStorage(deck.language);
      this.noTags$.next(storage.noTags);
      this.selectedTags$.next(
        deck.tags.filter((tag) => storage.tagIds.includes(tag.id))
      );
    });

    combineLatest([this.selectedTags$, this.noTags$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([selectedTags, noTags]) => {
        if (!this.language) {
          return;
        }

        setLanguageTagStorage(this.language, {
          noTags,
          tagIds: selectedTags.map((tag) => tag.id),
        });
      });

    combineLatest([this.allCards$, this.selectedTags$, this.noTags$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([allCards, selectedTags, noTags]) => {
        if (noTags) {
          this.cardItems = allCards.filter(
            (card) => card.data.tags.length === 0
          );
          return;
        }

        if (selectedTags.length > 0) {
          const selectedTagIds = new Set(selectedTags.map((tag) => tag.id));
          this.cardItems = allCards.filter((card) =>
            card.data.tags.some((tag) => selectedTagIds.has(tag.id))
          );
          return;
        }

        this.cardItems = allCards;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  onSelectTags(tags: TagItem[]): void {
    this.selectedTags$.next(tags);
  }

  onNoTags(noTags: boolean): void {
    this.noTags$.next(noTags);
  }

  removeTag(tag: TagItem): void {
    this.tagsDropdown?.toggle(tag);
  }
}
