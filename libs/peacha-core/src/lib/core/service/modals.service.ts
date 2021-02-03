import { Injectable, Injector, ElementRef } from '@angular/core';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector, ComponentType } from '@angular/cdk/portal';
import { MODAL_DATA_TOKEN } from '../tokens';
import { Subject } from 'rxjs';

@Injectable()
export class ModalService {
	constructor(private overlay: Overlay, private injector: Injector) { }

	open<T, R = any>(t: ComponentType<T>, data?: any, closeOnClickBackDrop?: boolean) {
		const overlayRef = this.overlay.create({
			// scrollStrategy: this.overlay.scrollStrategies.close({

			// }),
			hasBackdrop: true,
			positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
			scrollStrategy: this.overlay.scrollStrategies.block(),
		});

		const dialogRef = new ModalRef<T, R>(overlayRef, closeOnClickBackDrop);
		const its = new WeakMap();
		its.set(ModalRef, dialogRef);
		its.set(MODAL_DATA_TOKEN, data);
		const injector = new PortalInjector(this.injector, its);

		const portal = new ComponentPortal(t, null, injector);
		const cpref = overlayRef.attach(portal);
		dialogRef.instance = cpref.instance;
		return dialogRef;
	}

	openFloat<T, R>(t: ComponentType<T>, elementRef: ElementRef, data?: any, closeOnClickBackDrop?: boolean) {
		const overlayRef = this.overlay.create({
			scrollStrategy: this.overlay.scrollStrategies.noop(),
			hasBackdrop: true,
			backdropClass: 'cdk-overlay-transparent-backdrop',
			positionStrategy: this.overlay
				.position()
				.flexibleConnectedTo(elementRef)
				.withPositions([
					{
						originX: 'start',
						originY: 'bottom',
						overlayX: 'end',
						overlayY: 'bottom',
						offsetX: -16,
					},
				]),
		});

		const dialogRef = new ModalRef<T, R>(overlayRef, closeOnClickBackDrop);
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

export class ModalRef<T, R = any> {
	constructor(private overlayRef: OverlayRef, private closeOnClickBackDrop = false) {
		overlayRef.backdropClick().subscribe(s => {
			if (closeOnClickBackDrop) {
				this.close();
			}
		});
		// overlayRef.detachments().subscribe(_ => {
		//     this.close();
		// });
	}
	// private _beforeClose = new Subject<void>();
	private _afterClosed = new Subject<R | undefined>();

	instance: T;

	close(result?: R) {
		this.overlayRef.dispose();
		this._afterClosed.next(result);
		this._afterClosed.complete();
		this.instance = null;
		this._afterClosed = null;
	}

	cancel() {
		this.close();
	}

	afterClosed() {
		return this._afterClosed.asObservable();
	}
}
