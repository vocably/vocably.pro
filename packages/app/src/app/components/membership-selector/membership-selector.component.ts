import { Component, OnDestroy, OnInit } from '@angular/core';
import { getPaddleInstance } from '@paddle/paddle-js';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import {
  getSubscriptionProducts,
  SubscriptionProduct,
} from '../../subscription-products';

@Component({
  selector: 'app-membership-selector',
  templateUrl: './membership-selector.component.html',
  styleUrls: ['./membership-selector.component.scss'],
  standalone: false,
})
export class MembershipSelectorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  subscriptionProducts: SubscriptionProduct[] | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    getSubscriptionProducts().then((products) => {
      this.subscriptionProducts = products;
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
