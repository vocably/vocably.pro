import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';

import { MembershipRoutingModule } from './membership-routing.module';
import { MembershipComponent } from './membership/membership.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { WhyPaidComponent } from './pages/index-page/why-paid/why-paid.component';

@NgModule({
  imports: [
    CommonModule,
    MembershipRoutingModule,
    IonicModule,
    MatIconModule,
    MatDialogModule,
    MembershipComponent,
    IndexPageComponent,
    WhyPaidComponent,
  ],
})
export class MembershipModule {}
