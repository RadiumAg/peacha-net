import { Injectable, Injector, ElementRef } from '@angular/core';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { ToastComponent, TOAST_MESSAGE } from './toast.component';

@Injectable({ providedIn: 'root' })
export class Toast {
	PositionStrategy: PositionStrategy;
	overlayRef: OverlayRef;
	overlayRefMap: Map<symbol, OverlayRef> = new Map();
	constructor(private overlay: Overlay, private injector: Injector) {}

	show(text: string, config?: ToastConfig) {
		this.PositionStrategy =
			config?.el !== undefined
				? this.overlay
						.position()
						.flexibleConnectedTo(config.el)
						.withPositions([
							{
								originX: 'start',
								originY: 'bottom',
								overlayX: 'start',
								overlayY: 'top',
							},
						])
				: config?.origin !== undefined
				? this.overlay
						.position()
						.global()
						.top(`${config?.origin?.clientY + 8}px`)
						.left(`${config?.origin?.clientX + 8}px`)
				: this.overlay.position().global().centerHorizontally().bottom('20%');

		this.overlayRef = this.overlay.create({
			scrollStrategy: this.overlay.scrollStrategies.reposition(),
			hasBackdrop: false,
			positionStrategy: this.PositionStrategy,
		});

		const its = new WeakMap();
		its.set(TOAST_MESSAGE, {
			text,
			type: config?.type ?? 'link',
		});
		const injector = new PortalInjector(this.injector, its);
		const portal = new ComponentPortal(ToastComponent, null, injector);
		const componentRef = this.overlayRef.attach(portal);
		componentRef.instance.animation$.subscribe(ani => {
			if (ani.toState === 'void' && ani.phaseName === 'done') {
				this.overlayRef.dispose();
			}
		});

		this.remove(config);
	}

	private remove(config: ToastConfig) {
		const symbol = Symbol();
		this.overlayRefMap.set(symbol, this.overlayRef);
		const timer = setTimeout(
			() => {
				this.overlayRefMap.get(symbol).detach();
				clearTimeout(timer);
			},
			config?.timeout === undefined ? 1000 : config?.timeout
		);
	}

	close() {
		if (this.overlayRef) {
			this.overlayRef.detach();
		}
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
	el?: ElementRef;
}
