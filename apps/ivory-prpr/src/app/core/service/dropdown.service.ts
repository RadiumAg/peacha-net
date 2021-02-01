import { Injectable, ElementRef, ViewContainerRef, TemplateRef } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Injectable()
export class DropDownService {


    private protal: TemplatePortal;
    constructor(private overlay: Overlay) {

    }


    menu(E: ElementRef, T: TemplateRef<any>,vc:ViewContainerRef,X?:number,Y?:number) {
        const overlayRef = this.overlay.create({
            scrollStrategy: this.overlay.scrollStrategies.close(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            positionStrategy: this.overlay
                .position()
                .flexibleConnectedTo(E)
                .withPositions([
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                        offsetY: Y??0,
                        offsetX: X??0,
                    }
                ])
        });
        this.protal = new TemplatePortal(T,vc);
        overlayRef.backdropClick().subscribe(s => {
            this.protal.detach()
        })
        this.protal.attach(overlayRef);
    }

    close(){
        this.protal?.detach()
    }

}
