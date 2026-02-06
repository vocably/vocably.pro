import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const googleLogoURL = 'assets/google.svg';

@Component({
  selector: 'app-google-icon',
  templateUrl: './google-icon.component.html',
  styleUrls: ['./google-icon.component.scss'],
  standalone: false,
})
export class GoogleIconComponent implements OnInit {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl(googleLogoURL)
    );
  }

  ngOnInit(): void {}
}
