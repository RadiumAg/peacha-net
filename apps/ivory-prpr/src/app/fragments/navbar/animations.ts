import { animate, trigger, state, style, transition } from '@angular/animations';

export const DASHBOARD_ANIMATION = trigger('dashboard', [
    transition(':enter', [
        style({ opacity: 0.6, transform: 'scale3d(0.95,0.95,0.95)', 'transform-origin': '100% 0' }),
        animate('150ms', style({ opacity: 1, transform: 'scale3d(1,1,1)' }))
    ]),
    transition(':leave', [
        animate('100ms', style({ opacity: 0 }))
    ])
])

export const AVATAR_ANIMATION = trigger('avatar', [
    state('normal', style({

    })),
    state('active', style({
        zIndex:'10000',
        transform: 'scale3d(1.8,1.8,1) translate3d(-10px,20px,0)',
        'pointer-events': 'none'
    })),
    transition('normal => active', [
        style({
            'pointer-events': 'none'
        }),
        animate('180ms ease')
    ]),
    transition('active => normal', [
        animate('100ms ease')
    ])
])
