import { Component, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [TranslocoModule],
})
export class SignInComponent implements OnInit {
  public wwwBaseUrl = environment.wwwBaseUrl;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {}
}
