import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const hideAnimation = trigger('hide', [
  state('true', style({ transform: 'scale(1.5)', opacity: '0' })),
  transition('false => true', [
    animate(
      '0.3s',
      keyframes([
        style({ transform: 'scale(1)', opacity: '1' }),
        style({ transform: 'scale(1.5)', opacity: '0' }),
      ])
    ),
  ]),
]);
