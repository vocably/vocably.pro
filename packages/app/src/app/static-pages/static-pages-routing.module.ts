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
    title: 'page.welcome',
    component: WelcomeComponent,
  },
  {
    path: 'user-info',
    title: 'page.user_info',
    component: UserInfoPageComponent,
  },
  {
    path: 'uninstall',
    title: 'page.uninstall',
    component: UninstallComponent,
  },
  {
    path: 'ios-extension/:sourceLanguage/:targetLanguage',
    title: 'page.ios_extension',
    component: IosExtensionComponent,
  },
  {
    path: 'ios-extension/:sourceLanguage',
    title: 'page.ios_extension',
    component: IosExtensionComponent,
  },
  {
    path: 'ios-extension',
    title: 'page.ios_extension',
    component: IosExtensionComponent,
  },
  {
    path: 'android-translate/:sourceLanguage/:targetLanguage',
    title: 'page.android_translate',
    component: AndroidTranslateComponent,
  },
  {
    path: 'android-translate/:sourceLanguage',
    title: 'page.android_translate',
    component: AndroidTranslateComponent,
  },
  {
    path: 'android-translate',
    title: 'page.android_translate',
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
