import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GoogleLanguage } from '@vocably/model';

@Component({
  selector: 'app-language-icon',
  template: `<img [src]="url" alt="Flag" />`,
  styleUrls: ['./language-icon.component.scss'],
})
export class LanguageIconComponent implements OnInit {
  @Input() language!: GoogleLanguage;

  url!: SafeResourceUrl;

  constructor(private domSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(
      `assets/flags/${this.language}.svg`
    );
  }
}
