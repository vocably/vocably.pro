import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sign-out-page',
  templateUrl: './sign-out-page.component.html',
  styleUrls: ['./sign-out-page.component.scss'],
  imports: [HeaderComponent],
})
export class SignOutPageComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.signOut();
  }
}
