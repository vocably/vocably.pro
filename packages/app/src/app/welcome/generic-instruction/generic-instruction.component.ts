import { Component, Input, OnInit } from '@angular/core';
import { GoogleLanguage } from '@vocably/model';

@Component({
  selector: 'app-generic-instruction',
  templateUrl: './generic-instruction.component.html',
  styleUrls: ['./generic-instruction.component.scss'],
  standalone: false,
})
export class GenericInstructionComponent implements OnInit {
  @Input() sourceLanguage!: GoogleLanguage;
  @Input() targetLanguage!: GoogleLanguage;

  constructor() {}

  ngOnInit(): void {}
}
