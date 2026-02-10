import { Component, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-expansion',
  templateUrl: './expansion.component.html',
  styleUrls: ['./expansion.component.scss'],
  imports: [MatIcon],
})
export class ExpansionComponent implements OnInit {
  @Input() label: string = '';
  @Input() panelStyle: string = '';

  isExpanded = false;

  constructor() {}

  ngOnInit(): void {}
}
