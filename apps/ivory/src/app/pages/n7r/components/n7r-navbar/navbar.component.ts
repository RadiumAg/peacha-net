import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ChatStartService, ModalService } from '@peacha-core';
import { Logout, UserState } from '@peacha-core/state';
import { BehaviorSubject, Observable } from 'rxjs';
import { DASHBOARD_ANIMATION, AVATAR_ANIMATION } from '../../../../fragments/navbar/animations';
import { N7rOrder } from '../order/order';

@Component({
	selector: 'ivo-n7r-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.less'],
	animations: [DASHBOARD_ANIMATION, AVATAR_ANIMATION],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class N7rNavbarComponent {
	@Select(UserState.isLogin)
	isLogin$: BehaviorSubject<boolean>;

	@Select(UserState.basicInfo)
	info$: Observable<{
		nickname: string;
		avatar: string;
		id: number;
		num_followed: number;
		num_following: number;
		banner: string;
	}>;

	@ViewChild('template')
	dashboard: TemplateRef<HTMLDivElement>;

	@ViewChild('avatar', { static: false })
	avatarElement: ElementRef<HTMLImageElement>;

	private currentOverlay: OverlayRef;
	private portal: TemplatePortal;

	isPortalShowing$ = new BehaviorSubject<boolean>(false);

	constructor(
		private store: Store,
		private router: Router,
		private overlay: Overlay,
		private vc: ViewContainerRef,
		private dialog: ChatStartService,
		private modal: ModalService
	) { }

	leaveDashboard(): void {
		if (this.isPortalShowing$.value) {
			this.isPortalShowing$.next(false);
			this.portal.detach();
		}
	}

	hoverAvatar(_e: Event): void {
		this.currentOverlay = this.overlay.create({
			positionStrategy: this.overlay
				.position()
				.flexibleConnectedTo(this.avatarElement)
				.withPositions([
					{
						originX: 'end',
						originY: 'top',
						overlayX: 'start',
						overlayY: 'top',
					},
				]),
		});
		this.portal = new TemplatePortal(this.dashboard, this.vc);
		// }
		if (this.isPortalShowing$.value) {
			return;
		}
		this.isPortalShowing$.next(true);
		this.portal.attach(this.currentOverlay);
	}

	logout(): void {
		this.store.dispatch(new Logout()).subscribe(
			_s => {
				if (this.isPortalShowing$.value) {
					this.portal.detach();
				}
				this.router.navigate(['/']);
				this.isPortalShowing$.next(false);
				this.dialog.disconnectWs();
			},
			e => {
				if (e.code == 401 || e.code == 403) {
					this.router.navigate(['/passport/login']);
				}
			}
		);
	}

	toUser(i: number): void {
		this.router.navigate(['user', i]);
	}

	toOrderList(): void {
		this.modal.open(N7rOrder)
	}
}
