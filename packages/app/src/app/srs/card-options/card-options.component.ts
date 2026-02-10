import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TooltipTriggerForDirective } from '../../components/tooltip/tooltip-trigger-for.directive';
import { TooltipComponent } from '../../components/tooltip/tooltip.component';
import { Answer } from '../card/card.component';

@Component({
  selector: 'app-srs-card-options',
  templateUrl: './card-options.component.html',
  styleUrls: ['./card-options.component.scss'],
  imports: [TooltipComponent, MatIcon, TooltipTriggerForDirective],
})
export class CardOptionsComponent implements OnInit {
  @Output() flip = new EventEmitter();
  @Output() answer = new EventEmitter<Answer>();

  constructor() {}

  ngOnInit(): void {}

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.flip.emit();
      return;
    }

    if (event.code === 'ArrowRight') {
      this.answer.emit('strong');
    }

    if (event.code === 'ArrowLeft') {
      this.answer.emit('weak');
    }

    if (event.code === 'ArrowDown') {
      this.answer.emit('somewhat');
    }
  }
}
