import { trigger, transition, style, animate } from '@angular/animations';

export const MODAL_ANIMATION = trigger('modalEnterLeaveTrigger', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
    ]),
    transition(':leave', [
        animate('100ms', style({ opacity: 0 }))
    ])
]);
