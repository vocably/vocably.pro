import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { SecondPageComponent } from './pages/second-page/second-page.component';
import { WelcomeComponent } from './welcome.component';

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    children: [
      {
        path: '',
        title: 'page.welcome',
        component: IndexPageComponent,
      },
      {
        path: ':sourceLanguage/:targetLanguage',
        title: 'page.try_out',
        component: SecondPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WelcomeRoutingModule {}
