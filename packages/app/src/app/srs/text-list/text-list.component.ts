import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { explode } from '@vocably/sulna';

@Component({
  selector: '[text-list]',
  templateUrl: './text-list.component.html',
  styleUrls: ['./text-list.component.scss'],
  imports: [],
})
export class TextListComponent implements OnInit {
  private _text: string = '';

  @Input() set text(text: string) {
    this._text = text;
    this.updateText();
  }

  public items: string[] = [];

  private updateText() {
    this.items = explode(this._text);
  }

  constructor() {}

  ngOnInit(): void {}
}
