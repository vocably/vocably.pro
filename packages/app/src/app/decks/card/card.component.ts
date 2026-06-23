import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CardItem } from '@vocably/model';
import { TextListComponent } from '../../srs/text-list/text-list.component';
import { sanitizeTranscript } from '@vocably/sulna';
import { PlaySoundComponent } from '../../components/play-sound/play-sound.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [NgIf, TextListComponent, PlaySoundComponent],
})
export class CardComponent implements OnInit {
  @Input() item!: CardItem;

  constructor() {}

  ngOnInit(): void {}

  protected readonly sanitizeTranscript = sanitizeTranscript;
}
