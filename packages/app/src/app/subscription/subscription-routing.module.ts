import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { SuccessPageComponent } from './pages/success-page/success-page.component';
import { SubscriptionComponent } from './subscription/subscription.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionComponent,
    children: [
      {
        path: '',
        title: 'page.subscribe',
        component: IndexPageComponent,
      },
      {
        path: 'success/:priceId',
        title: 'page.subscription_success',
        component: SuccessPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubscriptionRoutingModule {}
