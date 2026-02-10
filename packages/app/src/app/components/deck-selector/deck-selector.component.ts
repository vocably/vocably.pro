import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatOption } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { GoogleLanguage } from '@vocably/model';
import { LanguagePipe } from '../../language/language.pipe';

@Component({
  selector: 'app-deck-selector',
  templateUrl: './deck-selector.component.html',
  styleUrls: ['./deck-selector.component.scss'],
  imports: [MatIcon, NgIf, MatSelect, MatOption, LanguagePipe],
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
