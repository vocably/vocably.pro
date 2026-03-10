import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { EntitlementInfo, Purchases } from '@revenuecat/purchases-js';
import { getUserStaticMetadata } from '@vocably/api';
import { startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { MembershipSelectorComponent } from '../../../components/membership-selector/membership-selector.component';
import { HeaderComponent } from '../../../header/header.component';
import { WhyPaidComponent } from './why-paid/why-paid.component';

type MembershipStatus =
  | {
      type: 'loading';
    }
  | {
      type: 'free';
    }
  | {
      type: 'paid_group';
    }
  | {
      type: 'revenue_cat';
      managementUrl: string | null;
      nextPaymentDate: Date | null;
      endDate: Date | null;
      entitlementInfo: EntitlementInfo;
    }
  | {
      type: 'error';
    };

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
  imports: [
    HeaderComponent,
    NgIf,
    IonicModule,
    MembershipSelectorComponent,
    TranslocoModule,
  ],
})
export class IndexPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  public membershipStatus: MembershipStatus = {
    type: 'loading',
  };

  public reload$ = new Subject<'with_loader' | 'without_loader'>();

  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.reload$
      .pipe(
        startWith('with_loader'),
        tap(() => {
          this.membershipStatus = {
            type: 'loading',
          };
        }),
        switchMap(() => {
          return this.authService.fetchUserData$.pipe(
            switchMap((userData) => {
              const purchases = Purchases.configure(
                'rcb_npVnGSbfiQAcvvQkQxFrIEiGibAJ',
                userData.email
              );
              return Promise.all([
                this.authService.isPaidGroup(),
                purchases.getCustomerInfo(),
                getUserStaticMetadata(),
              ]);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ([isPaidGroup, customerInfo, staticMetadataResult]) => {
          if (customerInfo.entitlements.active['premium']) {
            this.membershipStatus = {
              type: 'revenue_cat',
              nextPaymentDate:
                (customerInfo.entitlements.active['premium'] &&
                  customerInfo.entitlements.active['premium'].willRenew &&
                  customerInfo.entitlements.active['premium'].expirationDate) ||
                null,
              managementUrl:
                customerInfo.entitlements.active['premium'] &&
                customerInfo.entitlements.active['premium'].store ===
                  'paddle' &&
                staticMetadataResult.success === true
                  ? staticMetadataResult.value.management_url
                  : customerInfo.managementURL,
              endDate:
                (customerInfo.entitlements.active['premium'] &&
                  !customerInfo.entitlements.active['premium'].willRenew &&
                  customerInfo.entitlements.active['premium'].expirationDate) ||
                null,
              entitlementInfo: customerInfo.entitlements.active['premium'],
            };

            return;
          } else if (isPaidGroup) {
            this.membershipStatus = {
              type: 'paid_group',
            };
          } else {
            this.membershipStatus = {
              type: 'free',
            };
          }
        },
        error: () => {
          this.membershipStatus = {
            type: 'error',
          };
        },
      });
  }

  showWhyPaid() {
    this.dialog.open(WhyPaidComponent);
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
