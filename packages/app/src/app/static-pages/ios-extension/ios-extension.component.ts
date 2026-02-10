import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from '../../header/logo/logo.component';

@Component({
  selector: 'app-ios-extension',
  templateUrl: './ios-extension.component.html',
  styleUrls: ['./ios-extension.component.scss'],
  imports: [LogoComponent, IonicModule],
})
export class IosExtensionComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    location.href = 'https://vocably.pro/ios-safari-extension.html';
  }
}
