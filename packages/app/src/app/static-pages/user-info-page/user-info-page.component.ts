import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-user-info-page',
  templateUrl: './user-info-page.component.html',
  styleUrls: ['./user-info-page.component.scss'],
  imports: [HeaderComponent, AsyncPipe, JsonPipe],
})
export class UserInfoPageComponent implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit(): void {}
}
