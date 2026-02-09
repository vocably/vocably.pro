import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-srs-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  standalone: false,
})
export class SuccessComponent implements OnInit {
  @Output() oneMoreRound = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
