import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DecksComponent } from './decks.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { EditPageComponent } from './pages/edit-page/edit-page.component';
import { ExportPageComponent } from './pages/export-page/export-page.component';
import { NoDecksPageComponent } from './pages/no-decks-page/no-decks-page.component';
import { StudyPageComponent } from './pages/study-page/study-page.component';
import { SelectedDeckComponent } from './selected-deck/selected-deck.component';

const routes: Routes = [
  {
    path: '',
    component: DecksComponent,
    children: [
      {
        path: '',
        title: 'page.set_up',
        component: NoDecksPageComponent,
      },
      {
        path: ':language',
        component: SelectedDeckComponent,
        children: [
          {
            path: '',
            title: 'page.dashboard',
            component: DashboardPageComponent,
          },
          {
            path: 'study',
            title: 'page.study',
            component: StudyPageComponent,
            data: {
              title: 'page.study',
              cleanScreen: true,
            },
            children: [],
          },
          {
            path: 'edit',
            title: 'page.edit_deck',
            component: EditPageComponent,
            data: {
              title: 'page.edit_deck',
            },
            children: [],
          },
          {
            path: 'edit/export',
            title: 'page.export_deck',
            component: ExportPageComponent,
            data: {
              title: 'page.export_deck',
            },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DecksRoutingModule {}
