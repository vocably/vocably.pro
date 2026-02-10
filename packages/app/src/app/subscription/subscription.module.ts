import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';

import { IndexPageComponent } from './pages/index-page/index-page.component';
import { SuccessPageComponent } from './pages/success-page/success-page.component';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionComponent } from './subscription/subscription.component';

@NgModule({
  imports: [
    CommonModule,
    SubscriptionRoutingModule,
    IonicModule,
    MatIconModule,
    SubscriptionComponent,
    IndexPageComponent,
    SuccessPageComponent,
  ],
})
export class SubscriptionModule {}
