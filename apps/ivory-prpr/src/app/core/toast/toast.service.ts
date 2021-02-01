import { Injectable, Injector, ElementRef } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { ToastComponent, TOAST_MESSAGE } from './toast.component';

@Injectable()
export class Toast {

    constructor(private overlay: Overlay, private injector: Injector) { }

    show(text: string, config?: ToastConfig) {
        const positionStrategy = config?.el != undefined ? this.overlay.position().flexibleConnectedTo(config.el).withPositions([{
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
        }]) : (config?.origin != undefined ?
            this.overlay.position().global().width('auto').top(`${config?.origin?.clientY + 8}px`).left(`${config?.origin?.clientX + 8}px`) :
            this.overlay.position().global().width('auto').centerHorizontally().bottom('20%'))
        // const positionStrategy = config?.origin != undefined ?
        //     this.overlay.position().global().width('auto').top(`${config?.origin?.clientY + 8}px`).left(`${config?.origin?.clientX + 8}px`) :
        //     this.overlay.position().global().width('auto').centerHorizontally().bottom('20%');

        const overlayRef = this.overlay.create({
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: false,
            positionStrategy
        });

        const its = new WeakMap();
        its.set(TOAST_MESSAGE, {
            text,
            type: config?.type ?? 'link'
        });
        const injector = new PortalInjector(this.injector, its);
        const portal = new ComponentPortal(ToastComponent, null, injector);
        const componentRef = overlayRef.attach(portal);
        // componentRef.instance.
        componentRef.instance.animation$.subscribe(ani => {
            if (ani.toState == 'void' && ani.phaseName == 'done') {
                overlayRef.dispose();
            }
        });

        setTimeout(() => {
            overlayRef.detach();
        }, config?.timeout == undefined ? 1000 : config?.timeout!);
    }
}

export interface Origin {
    clientX: number;
    clientY: number;
}

export interface ToastConfig {
    timeout?: number;
    type?: 'success' | 'link' | 'warn' | 'error';
    position?: 'global' | 'relative';
    origin?: Origin;
    el?: ElementRef
}
