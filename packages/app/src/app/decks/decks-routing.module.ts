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
        title: 'Set Up',
        component: NoDecksPageComponent,
      },
      {
        path: ':language',
        component: SelectedDeckComponent,
        children: [
          {
            path: '',
            title: 'Dashboard',
            component: DashboardPageComponent,
          },
          {
            path: 'study',
            title: 'Study',
            component: StudyPageComponent,
            data: {
              title: 'Study',
              cleanScreen: true,
            },
            children: [],
          },
          {
            path: 'edit',
            title: 'Edit',
            component: EditPageComponent,
            data: {
              title: 'Edit Deck',
            },
            children: [],
          },
          {
            path: 'edit/export',
            title: 'Export Deck',
            component: ExportPageComponent,
            data: {
              title: 'Export Deck',
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
