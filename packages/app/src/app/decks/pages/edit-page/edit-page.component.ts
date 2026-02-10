import { NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { deleteLanguageDeck } from '@vocably/api';
import { byDate, CardItem, getFullLanguageName } from '@vocably/model';
import { omit } from 'lodash-es';
import { Subject, takeUntil } from 'rxjs';
import { BackButtonComponent } from '../../../components/back-button/back-button.component';
import { LoaderService } from '../../../components/loader.service';
import { DeckListStoreService } from '../../deck-list-store.service';
import { DeckStoreService } from '../../deck-store.service';
import { DeckService } from '../../deck.service';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';
import { EditCardComponent } from './edit-card/edit-card.component';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss'],
  imports: [
    BackButtonComponent,
    IonicModule,
    RouterLink,
    NgFor,
    EditCardComponent,
  ],
})
export class EditPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public cards: CardItem[] = [];
  public deleted: CardItem[] = [];
  public fullLanguage: string = '';

  public updating: Record<string, CardItem> = {};

  constructor(
    public deckStore: DeckStoreService,
    public loader: LoaderService,
    public deckListStore: DeckListStoreService,
    public deckService: DeckService,
    public dialog: MatDialog
  ) {
    this.deckStore.deck$.pipe(takeUntil(this.destroy$)).subscribe((deck) => {
      this.fullLanguage = getFullLanguageName(deck.language ?? '');
      this.cards = [...deck.cards, ...this.deleted].sort(byDate);
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  saveCard(card: CardItem) {
    this.updating = {
      ...this.updating,
      [card.id]: card,
    };

    // Monkey-patch the update operation.
    // The card collapse animation freezes without this.
    setTimeout(() => {
      this.deckService.update(card.id, card.data).subscribe(() => {
        this.updating = omit(this.updating, [card.id]);
      });
    }, 500);
  }

  deleteCard(card: CardItem) {
    this.deleted = [...this.deleted, card];
    this.deckService.delete(card.id).pipe(takeUntil(this.destroy$)).subscribe();
  }

  async restoreCard(card: CardItem) {
    this.deleted = this.deleted.filter(
      (deletedCard) => deletedCard.id !== card.id
    );

    this.deckService.restore(card).pipe(takeUntil(this.destroy$)).subscribe();
  }

  deleteDeck() {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { fullLanguage: this.fullLanguage },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result !== true) {
        return;
      }

      const loaderRef = this.loader.show({
        message: 'Deleting the deck...',
      });
      await deleteLanguageDeck(this.deckStore.deck$.value.language);
      this.deckListStore.reload$.next(null);
      loaderRef.close();
    });
  }
}
