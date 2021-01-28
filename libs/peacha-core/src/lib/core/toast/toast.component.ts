import { Component, InjectionToken, Inject, HostBinding, HostListener } from '@angular/core';
import { trigger, style, transition, animate, AnimationEvent } from '@angular/animations';
import { Subject } from 'rxjs';

@Component({
    template: `{{message.text}}`,
    styles: [
        `:host{
            display: block;
            user-select: none;
            color: white;
            padding: 14px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 14px;
        }
        :host.error {
            background-color: #ff6464;
            box-shadow: 0 2px 10px 1px rgba(255,100,100,0.2);
        }
        :host.link {
            background-color: #48bbf8;
            box-shadow: 0 2px 10px 1px rgba(72,187,248,0.2);
        }
        :host.warn {
            background-color: #ffb243;
            box-shadow: 0 2px 10px 1px rgba(255,190,68,0.2);
        }
        :host.success {
            background-color: #47d279;
            box-shadow: 0 2px 10px 1px rgba(71,210,121,0.2);
        }`
    ],
    animations: [
        trigger('popani', [
            transition(':enter', [
                style({
                    transform: 'translate3d(0,60%,0)',
                    opacity: 0
                }),
                animate('.3s cubic-bezier(0.22, 0.58, 0.12, 0.98)', style({ transform: 'translate3d(0,0,0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translate3d(0,0,0)', opacity: 1 }),
                animate('.3s cubic-bezier(0.22, 0.58, 0.12, 0.98)', style({ transform: 'translate3d(0,30%,0)', opacity: 0 }))
            ])
        ])
    ]
})
export class ToastComponent {
    constructor(@Inject(TOAST_MESSAGE) public message: ToastMessage) {
        this.classes = message.type;
    }
    @HostBinding('@popani') animation: string;
    animation$ = new Subject<AnimationEvent>();
    @HostBinding('class') classes: string;
    @HostListener('@popani.start', ['$event'])
    @HostListener('@popani.done', ['$event'])
    done(event: AnimationEvent) {
        this.animation$.next(event);
    }
}

export interface ToastMessage {
    text: string;
    type: 'success' | 'link' | 'warn' | 'error';
}

export const TOAST_MESSAGE = new InjectionToken<ToastMessage>('toast message');
