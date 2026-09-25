import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { isAndroid, isFirefoxBrowser } from '../../../../browser';
import { HeaderComponent } from '../../../header/header.component';
import { CarouselComponent } from '../../carousel/carousel.component';
import { SignUpComponent } from '../../sign-up/sign-up.component';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  imports: [
    NgIf,
    TranslocoModule,
    HeaderComponent,
    CarouselComponent,
    SignUpComponent,
  ],
})
export class SignUpPageComponent implements AfterViewInit {
  showCarousel = !isFirefoxBrowser && !isAndroid;

  @ViewChild('formAnchor') formAnchor?: ElementRef<HTMLElement>;

  constructor(private route: ActivatedRoute) {}

  ngAfterViewInit(): void {
    // The sign in page links here with #form when the visitor asked for the
    // sign up form, which otherwise sits below the carousel, out of sight.
    if (this.route.snapshot.fragment !== 'form') {
      return;
    }

    setTimeout(() =>
      this.formAnchor?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    );
  }
}
