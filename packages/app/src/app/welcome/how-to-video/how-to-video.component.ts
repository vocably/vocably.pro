import { Component, Input, OnInit } from '@angular/core';
import { GoogleLanguage, languageList } from '@vocably/model';
import posthog from 'posthog-js';

@Component({
  selector: 'app-how-to-video',
  templateUrl: './how-to-video.component.html',
  styleUrls: ['./how-to-video.component.scss'],
  standalone: false,
})
export class HowToVideoComponent implements OnInit {
  @Input() public targetLanguage!: GoogleLanguage;

  public videoLanguage:
    | 'en'
    | 'ru'
    | 'uk'
    | 'tr'
    | 'vi'
    | 'ko'
    | 'es'
    | 'pt'
    | 'zh' = 'en';

  public languageList = languageList;

  constructor() {}

  ngOnInit(): void {
    switch (this.targetLanguage) {
      case 'ru':
        this.videoLanguage = 'ru';
        break;
      case 'uk':
        this.videoLanguage = 'uk';
        break;
      case 'tr':
        this.videoLanguage = 'tr';
        break;
      case 'vi':
        this.videoLanguage = 'vi';
        break;
      case 'ko':
        this.videoLanguage = 'ko';
        break;
      case 'es':
        this.videoLanguage = 'es';
        break;
      case 'pt':
        this.videoLanguage = 'pt';
        break;
      case 'zh':
        this.videoLanguage = 'zh';
        break;
      case 'zh-TW':
        this.videoLanguage = 'zh';
        break;
      default:
        this.videoLanguage = 'en';
    }
  }

  onPlay() {
    posthog.capture('play_video');
  }
}
