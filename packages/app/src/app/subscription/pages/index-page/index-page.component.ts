import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MembershipSelectorComponent } from '../../../components/membership-selector/membership-selector.component';

@Component({
  selector: 'app-index-page',
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
  imports: [MembershipSelectorComponent],
})
export class IndexPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
