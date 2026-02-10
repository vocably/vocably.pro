import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { GoogleLanguage } from '@vocably/model';

@Component({
  selector: 'app-language-button',
  templateUrl: './language-button.component.html',
  styleUrls: ['./language-button.component.scss'],
  imports: [MatRipple],
})
export class LanguageButtonComponent implements OnInit {
  @Output() onSelected = new EventEmitter<GoogleLanguage>();
  @Input() selected: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
