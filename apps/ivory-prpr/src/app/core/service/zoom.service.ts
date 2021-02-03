import { Injectable, Injector } from '@angular/core';
import { Overlay, ComponentType, OverlayRef } from '@angular/cdk/overlay';
import { MODAL_DATA_TOKEN } from '../tokens';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { ModalRef } from './modals.service';

@Injectable()
export class ZoomService{
    constructor(private overlay:Overlay, private injector: Injector){

    }

    open<T, R = any>(t: ComponentType<T>, data?: any) {
        const overlayRef = this.overlay.create({
            width:'100%',
            height:'100%',
            hasBackdrop: true,
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: this.overlay.scrollStrategies.block()
        });

        const dialogRef = new ModalRef<T, R>(overlayRef);
        const its = new WeakMap();
        its.set(ModalRef, dialogRef);
        its.set(MODAL_DATA_TOKEN, data);
        const injector = new PortalInjector(this.injector, its);

        const portal = new ComponentPortal(t, null, injector);
        const cpref = overlayRef.attach(portal);
        dialogRef.instance = cpref.instance;
        return dialogRef;
    }
}
