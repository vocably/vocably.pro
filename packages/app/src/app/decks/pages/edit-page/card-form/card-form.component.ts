import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardItem, SrsCard } from '@vocably/model';
import { pick } from 'lodash-es';

export type CardFormEntity = Pick<
  SrsCard,
  'source' | 'definition' | 'translation' | 'partOfSpeech' | 'example'
>;

@Component({
  selector: 'app-card-form',
  templateUrl: './card-form.component.html',
  styleUrls: ['./card-form.component.scss'],
  standalone: false,
})
export class CardFormComponent implements OnInit {
  @Input() item!: CardItem;
  @Output() save = new EventEmitter<CardFormEntity>();
  @Output() cancel = new EventEmitter();

  model!: CardFormEntity;

  constructor() {}

  ngOnInit(): void {
    this.model = pick(this.item.data, [
      'source',
      'definition',
      'translation',
      'partOfSpeech',
      'example',
    ]);
  }
}
