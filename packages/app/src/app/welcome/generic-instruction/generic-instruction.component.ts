import { Component, Input, OnInit } from '@angular/core';
import { GoogleLanguage } from '@vocably/model';
import { HighlightComponent } from '../highlight/highlight.component';
import { HowToVideoComponent } from '../how-to-video/how-to-video.component';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-generic-instruction',
  templateUrl: './generic-instruction.component.html',
  styleUrls: ['./generic-instruction.component.scss'],
  imports: [HighlightComponent, HowToVideoComponent, TranslocoModule],
})
export class GenericInstructionComponent implements OnInit {
  @Input() sourceLanguage!: GoogleLanguage;
  @Input() targetLanguage!: GoogleLanguage;

  constructor() {}

  ngOnInit(): void {}
}
