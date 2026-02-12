import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AndroidTranslateComponent } from './android-translate/android-translate.component';
import { IosExtensionComponent } from './ios-extension/ios-extension.component';
import { UiComponent } from './ui/ui.component';
import { UninstallComponent } from './uninstall/uninstall.component';
import { UserInfoPageComponent } from './user-info-page/user-info-page.component';
import { WelcomeComponent } from './welcome/welcome.component';

const routes: Routes = [
  {
    path: 'welcome',
    title: 'Welcome',
    component: WelcomeComponent,
  },
  {
    path: 'user-info',
    title: 'User Info',
    component: UserInfoPageComponent,
  },
  {
    path: 'uninstall',
    title: 'Uninstall',
    component: UninstallComponent,
  },
  {
    path: 'ios-extension/:sourceLanguage/:targetLanguage',
    title: 'iOS Safari Extension',
    component: IosExtensionComponent,
  },
  {
    path: 'ios-extension/:sourceLanguage',
    title: 'iOS Safari Extension',
    component: IosExtensionComponent,
  },
  {
    path: 'ios-extension',
    title: 'iOS Safari Extension',
    component: IosExtensionComponent,
  },
  {
    path: 'android-translate/:sourceLanguage/:targetLanguage',
    title: 'Translate with Android',
    component: AndroidTranslateComponent,
  },
  {
    path: 'android-translate/:sourceLanguage',
    title: 'Translate with Android',
    component: AndroidTranslateComponent,
  },
  {
    path: 'android-translate',
    title: 'Translate with Android',
    component: AndroidTranslateComponent,
  },
  {
    path: 'ui/:component',
    title: 'UI',
    component: UiComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaticPagesRoutingModule {}
