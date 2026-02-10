import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss'],
  imports: [RouterOutlet],
})
export class MembershipComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
