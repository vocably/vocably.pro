import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const hideAnimation = trigger('hide', [
  state('true', style({ transform: 'scale(1.2)', opacity: '0' })),
  transition('false => true', [
    animate(
      '0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
      keyframes([
        style({ transform: 'scale(1)', opacity: '1', offset: 0 }),
        style({ transform: 'scale(1.2)', opacity: '0', offset: 1 }),
      ])
    ),
  ]),
]);
