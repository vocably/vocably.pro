import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LanguageModule } from '../language/language.module';
import { AppQrCodeComponent } from './app-qr-code/app-qr-code.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { DeckSelectorComponent } from './deck-selector/deck-selector.component';
import { ExpansionComponent } from './expansion/expansion.component';
import { GoogleIconComponent } from './google-icon/google-icon.component';
import { LanguageIconComponent } from './language-icon/language-icon.component';
import { LanguageInputComponent } from './language-input/language-input.component';
import { LoaderComponent } from './loader/loader.component';
import { MembershipSelectorComponent } from './membership-selector/membership-selector.component';
import { SubscriptionStatusPipe } from './subscription-status.pipe';
import { TooltipTriggerForDirective } from './tooltip/tooltip-trigger-for.directive';
import { TooltipComponent } from './tooltip/tooltip.component';

@NgModule({
  declarations: [
    TooltipComponent,
    TooltipTriggerForDirective,
    BackButtonComponent,
    SubscriptionStatusPipe,
    GoogleIconComponent,
    LoaderComponent,
    LanguageInputComponent,
    LanguageIconComponent,
    ExpansionComponent,
    AppQrCodeComponent,
    DeckSelectorComponent,
    MembershipSelectorComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    OverlayModule,
    MatIconModule,
    HttpClientModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatRadioModule,
    MatSelectModule,
    MatMenuModule,
    LanguageModule,
  ],
  exports: [
    TooltipComponent,
    TooltipComponent,
    TooltipTriggerForDirective,
    BackButtonComponent,
    SubscriptionStatusPipe,
    GoogleIconComponent,
    LanguageInputComponent,
    LanguageIconComponent,
    ExpansionComponent,
    AppQrCodeComponent,
    DeckSelectorComponent,
    LoaderComponent,
    MembershipSelectorComponent,
  ],
})
export class ComponentsModule {}
