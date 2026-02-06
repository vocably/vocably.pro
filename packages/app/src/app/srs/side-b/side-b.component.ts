import { Component, Input, OnInit } from '@angular/core';
import { explode } from '@vocably/sulna';

type DefinitionItem = {
  text: string;
  class: string;
};

@Component({
  selector: '[app-side-b]',
  templateUrl: './side-b.component.html',
  styleUrls: ['./side-b.component.scss'],
  standalone: false,
})
export class SideBComponent implements OnInit {
  private _definition: string = '';
  private _translation: string = '';

  @Input() set definition(definition: string) {
    this._definition = definition;
    this.updateDefinitions();
  }

  @Input() set translation(translation: string) {
    this._translation = translation;
    this.updateDefinitions();
  }

  public definitions: DefinitionItem[] = [];

  private updateDefinitions() {
    this.definitions = explode(this._definition).map((text) => ({
      text,
      class: '',
    }));

    if (this._translation) {
      this.definitions.push({
        class: 'text-emphasize',
        text: this._translation,
      });
    }
  }

  constructor() {}

  ngOnInit(): void {}
}
