import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembershipComponent } from './membership/membership.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';

const routes: Routes = [
  {
    path: '',
    component: MembershipComponent,
    children: [
      {
        path: '',
        title: 'page.membership',
        component: IndexPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembershipRoutingModule {}
