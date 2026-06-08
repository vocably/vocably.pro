import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { getPaddleInstance } from '@paddle/paddle-js';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import {
  getSubscriptionProducts,
  SubscriptionProduct,
} from '../../subscription-products';
import { UserStaticMetadata } from '@vocably/model';
import { getUserStaticMetadata } from '@vocably/api';

@Component({
  selector: 'app-membership-selector',
  templateUrl: './membership-selector.component.html',
  styleUrls: ['./membership-selector.component.scss'],
  imports: [MatIcon, NgIf, NgFor, TranslocoModule],
})
export class MembershipSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  subscriptionProducts: SubscriptionProduct[] | null = null;
  staticMetadata: UserStaticMetadata | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    getSubscriptionProducts().then((products) => {
      this.subscriptionProducts = products;
    });

    getUserStaticMetadata().then((result) => {
      if (result.success) {
        this.staticMetadata = result.value;
      }
    });
  }

  onSelect(product: SubscriptionProduct) {
    this.authService.fetchUserData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userData) => {
        const paddleInstance = getPaddleInstance();
        if (!paddleInstance) {
          console.error('No paddle instance');
          return;
        }
        paddleInstance.Checkout.open({
          items: [
            {
              priceId: product.priceId,
            },
          ],
          customer: {
            email: userData.email,
          },
          customData: {
            revenue_cat_id: userData.email,
          },
          settings: {
            successUrl:
              location.origin + `/subscribe/success/${product.priceId}`,
          },
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
