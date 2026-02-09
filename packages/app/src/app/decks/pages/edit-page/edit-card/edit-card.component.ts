import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardItem } from '@vocably/model';
import { CardFormEntity } from '../card-form/card-form.component';

const animationSpeed = '0.2s';

@Component({
  selector: 'app-edit-card',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.scss'],
  standalone: false,
  animations: [
    trigger('card', [
      state(
        'hidden',
        style({
          height: '0',
        })
      ),
      state(
        'shown',
        style({
          height: '*',
        })
      ),
      transition('* => *', [animate(animationSpeed)]),
    ]),

    trigger('form', [
      transition(':enter', [
        style({
          height: '0',
        }),
        animate(
          animationSpeed,
          style({
            height: '*',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          animationSpeed,
          style({
            height: '0',
          })
        ),
      ]),
    ]),
  ],
})
export class EditCardComponent implements OnInit {
  @Input() item!: CardItem;
  @Input() isDeleted = false;
  @Output() delete = new EventEmitter();
  @Output() restore = new EventEmitter();
  @Output() save = new EventEmitter<CardItem>();

  isEdit = false;

  constructor() {}

  ngOnInit(): void {}

  onSave(entityValues: CardFormEntity) {
    this.save.emit({
      ...this.item,
      data: {
        ...this.item.data,
        ...entityValues,
      },
    });

    this.isEdit = false;
  }
}
