import { app_config } from './../../../global.config';
import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, TemplateRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, timer } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Router, ActivatedRoute } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DASHBOARD_ANIMATION, AVATAR_ANIMATION } from './animations';
import { PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserState, ModalService, CustomerService, ChatStartService } from '@peacha-core';
import { ChatState } from 'libs/peacha-core/src/lib/core/state/chat.state';
import { Logout } from 'libs/peacha-core/src/lib/core/state/user.action';

@Component({
	selector: 'ivo-navbar',
	templateUrl: './navbar.fragment.html',
	styleUrls: ['./navbar.fragment.less'],
	animations: [DASHBOARD_ANIMATION, AVATAR_ANIMATION],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarFragment {
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

	@Select(ChatState.unread)
	chatUnread$: BehaviorSubject<number>;

	@ViewChild('template')
	dashboard: TemplateRef<any>;

	@ViewChild('avatar', { static: false })
	avatarElement: ElementRef<HTMLImageElement>;

	input$: Observable<any> = this.route.queryParams.pipe(
		map(s => {
			return s.keyword ?? '';
		})
	);

	enablePaid = app_config.enablePaid;
	r: string;

	allCount$ = new BehaviorSubject(0);
	followerCount: number;
	private currentOverlay: OverlayRef;
	private portal: TemplatePortal;
	constructor(
		private store: Store,
		private router: Router,
		private route: ActivatedRoute,
		private overlay: Overlay,
		private vc: ViewContainerRef,
		private platform: PlatformLocation,
		private http: HttpClient,
		private modal: ModalService,
		private customer: CustomerService,
		private cdr: ChangeDetectorRef,
		private dialog: ChatStartService
	) {
		this.customer.count();
		this.isLogin$.subscribe(is => {
			if (is) {
				this.dialog.getWebsocketUrl();
			}
		});
	}

	params$ = this.route.queryParams;
	unread$ = new BehaviorSubject(this.customer.unreadCounnt);
	isPortalShowing$ = new BehaviorSubject<boolean>(false);

	timer$ = combineLatest([timer(0, 20000), this.unread$])
		.pipe(
			tap(([t, u]) => {
				this.isLogin$.subscribe(isLogin => {
					if (isLogin) {
						this.http
							.get<{
								newest: number;
								notice: number;
								star: number;
								forum: number;
								follow: number;
								cooperation: number;
							}>('/news/count')
							.subscribe(s => {
								this.allCount$.next(s.forum + s.notice + s.star + s.cooperation + u);
								this.followerCount = s.follow;
								this.cdr.markForCheck();
							});
					}
				});
			})
		)
		.subscribe();

	hoverAvatar(e: Event): void {
		// if (this.currentOverlay == undefined) {
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

	leaveDashboard(): void {
		if (this.isPortalShowing$.value) {
			this.isPortalShowing$.next(false);
			this.portal.detach();
		}
	}

	search(input: HTMLInputElement): void {
		this.r = this.platform.pathname.substr(8);
		if (input.value && input.value.match(/([^\s])/g)?.length > 0) {
			if (this.r == 'good' || this.r == 'user') {
				this.router.navigate(['./search/' + encodeURIComponent(this.r)], {
					queryParams: {
						keyword: input.value,
						p: 1,
					},
					queryParamsHandling: 'merge',
					relativeTo: this.route,
				});
			} else {
				this.route.queryParams.pipe(take(1)).subscribe(params => {
					this.router.navigate(['./search'], {
						queryParams: {
							keyword: input.value,
							choice: params.choice ?? 0,
						},
						queryParamsHandling: 'merge',
						relativeTo: this.route,
					});
				});
			}
		}
	}

	logout(): void {
		this.store.dispatch(new Logout()).subscribe(
			s => {
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

	toMessage(): void {
		this.router.navigate(['/message/chat']);
		// this.allCount = 0
	}

	seeFollow(id: number): void {
		this.router.navigate(['user', id, 'follower']);
		this.followerCount = 0;
		this.http.get('/news/follow/update').subscribe();
	}

	toUpload(): void {
		this.router.navigate(['/release']);
	}
}
