import { Directive, Input, TemplateRef, ElementRef, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge } from 'rxjs';
import { mapTo, filter } from 'rxjs/operators';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';

@Directive({
    selector: '[hover-dropdown]',
    exportAs: 'hoverDropdown'
})
export class HoverDropdownDirective {
    @Input('dropdown-content') dropdownTemplate: TemplateRef<any>;

    private strategy = this.overlay.position().flexibleConnectedTo(this.element.nativeElement).withLockedPosition();

    constructor(public element: ElementRef, private overlay: Overlay, private viewContainerRef: ViewContainerRef) { }

    private portal: TemplatePortal;
    private overlayRef: OverlayRef;

    mouseenter() {

    }

    // ngAfterViewInit() {
    //     this.overlayRef = this.overlay.create({
    //         positionStrategy: this.strategy,
    //         minWidth: 100,
    //         disposeOnNavigation: true,
    //         hasBackdrop: false,
    //         scrollStrategy: this.overlay.scrollStrategies.reposition()
    //     })
    //     merge(
    //         this.overlayRef.backdropClick(),
    //         this.overlayRef.detachments(),
    //         this.overlayRef.keydownEvents().pipe(filter(e => e.keyCode === ESCAPE && !hasModifierKey(e)))
    //     )
    //         .pipe(mapTo(false), takeUntil(this.destroy$))
    //         .subscribe(this.overlayClose$);

    //     if (!this.portal || this.portal.templateRef !== this.nzDropdownMenu!.templateRef) {
    //         this.portal = new TemplatePortal(this.nzDropdownMenu!.templateRef, this.viewContainerRef);
    //     }
    //     this.overlayRef.attach(this.portal);
    // }

    mouseleave() {

    }
}