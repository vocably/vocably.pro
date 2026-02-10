import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-srs-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [MatIcon],
})
export class SuccessComponent implements OnInit {
  @Output() oneMoreRound = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
