import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CardItem } from '@vocably/model';
import { SideBComponent } from '../../srs/side-b/side-b.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [NgIf, SideBComponent],
})
export class CardComponent implements OnInit {
  @Input() item!: CardItem;

  constructor() {}

  ngOnInit(): void {}
}
