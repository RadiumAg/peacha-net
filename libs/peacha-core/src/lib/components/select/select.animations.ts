import {
  animate,
  AnimationTriggerMetadata,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const SelectAnimations: {
  readonly transformPanel: AnimationTriggerMetadata;
} = {
  transformPanel: trigger('transformPanel', [
    state(
      'void',
      style({
        transform: ' translateY(0px)',
        minWidth: '100%',
        opacity: 0,
      })
    ),
    state(
      'showing',
      style({
        opacity: 1,
        minWidth: '100% ', // 32px = 2 * 16px padding
        transform: ' translateY(10px)',
      })
    ),

    transition('void => *', animate('120ms cubic-bezier(0, 0, 0.2, 1)')),
    transition(
      '* => void',
      animate('100ms 25ms linear', style({ opacity: 0 }))
    ),
  ]),
};
