import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GoogleLanguage } from '@vocably/model';

@Component({
  selector: 'app-deck-selector',
  templateUrl: './deck-selector.component.html',
  styleUrls: ['./deck-selector.component.scss'],
  standalone: false,
})
export class DeckSelectorComponent implements OnInit {
  @Input() languages: GoogleLanguage[] = [];
  @Input() value: GoogleLanguage | '' = '';
  @Input() disabled = false;
  @Output() change = new EventEmitter<GoogleLanguage>();

  constructor() {}

  ngOnInit(): void {}

  onChange(language: string) {
    this.change.emit(language as GoogleLanguage);
  }
}
