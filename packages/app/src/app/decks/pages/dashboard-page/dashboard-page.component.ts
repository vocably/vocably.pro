import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { byDate, CardItem } from '@vocably/model';
import { Subject, takeUntil } from 'rxjs';
import { isDesktop } from '../../../../browser';
import { DeckStoreService } from '../../deck-store.service';
import { MobileAppEncouragerComponent } from './mobile-app-encourager/mobile-app-encourager.component';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  standalone: false,
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public cardItems: CardItem[] = [];

  public isDesktop = isDesktop;

  constructor(
    public deckStore: DeckStoreService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.deckStore.deck$.pipe(takeUntil(this.destroy$)).subscribe((deck) => {
      this.cardItems = deck.cards.sort(byDate);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  async goToPractice() {
    const dialogRef = this.dialog.open(MobileAppEncouragerComponent);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (result) => {
        // if (!isBoolean(result)) {
        //   return;
        // }
        //
        // if (result === true) {
        //   localStorage.setItem('skip-mobile-app-encourager', 'true');
        // }
        //
        // await this.router.navigate(['study'], { relativeTo: this.route });
      });
  }
}
