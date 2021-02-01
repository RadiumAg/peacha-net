import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, timer } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Router, ActivatedRoute } from '@angular/router';
import { map, tap, take } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DASHBOARD_ANIMATION, AVATAR_ANIMATION } from './animations';
import { PlatformLocation } from '@angular/common';
import { UserState, ModalService } from '@peacha-core';
import { Logout } from 'libs/peacha-core/src/lib/core/state/user.action';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';




@Component({
    selector: 'ivo-navbar',
    templateUrl: './navbar.fragment.html',
    styleUrls: ['./navbar.fragment.less'],
    animations: [DASHBOARD_ANIMATION, AVATAR_ANIMATION],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarFragment {
    @Select(UserState.isLogin)
    isLogin$: Observable<boolean>;

    @Select(UserState.basicInfo)
    info$: Observable<{
        nickname: string;
        avatar: string;
        id: number;
        num_followed: number;
        num_following: number;
        banner: string;
    }>;

    @Select(UserState.identity_state)
    identity_state$: Observable<number>;


    @ViewChild('template')
    dashboard: TemplateRef<any>;

    @ViewChild('avatar', { static: false })
    avatarElement: ElementRef<HTMLImageElement>;

    input$: Observable<any> = this.route.queryParams.pipe(
        map((s) => {
            return s.keyword ?? '';
        })
    );


    allCount: number;
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
        private modal: ModalService,
    ) {
    }

    isPortalShowing$ = new BehaviorSubject<boolean>(false);

    hoverAvatar(e: Event) {


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

    leaveDashboard() {
        if (this.isPortalShowing$.value) {
            this.isPortalShowing$.next(false);
            this.portal.detach();
        }
    }
    r: string
    search(input: HTMLInputElement) {
        this.r = this.platform.pathname.substr(8)
        if (this.r == 'ikon' || this.r == 'Live2d' || this.r == 'good' || this.r == 'user') {
            //console.log(input.value)
            this.router.navigate(['./search/' + encodeURIComponent(this.r)], {
                queryParams: {
                    keyword: input.value,
                    p: 1
                },
                queryParamsHandling: 'merge',
                relativeTo: this.route,
            });
        } else {
            this.router.navigate(['./search/Live2d'], {
                queryParams: {
                    keyword: input.value,
                    p: 1
                },
                queryParamsHandling: 'merge',
                relativeTo: this.route,
            });
        }
    }

    logout() {
        this.store.dispatch(new Logout()).subscribe(
            s => {
                if (this.isPortalShowing$.value) {
                    this.portal.detach();
                    this.isPortalShowing$.next(false);
                }
                this.router.navigate(['/login']);
            },
            e => {
                this.router.navigate(['/login']);
            });
    }

    toUser(i: number) {
        this.router.navigate(['user', i])
    }

    toMessage() {
        this.router.navigate(['/message/likeme']);
        // this.allCount = 0
    }
    plan() {

    }

    seeFollow(id: number) {
        this.router.navigate(['user', id, 'follower']);
        this.followerCount = 0;
    }

    toUpload() {
        combineLatest(
            [this.isLogin$,
            this.identity_state$]
        ).pipe(
            take(1),
            tap(([is, s]) => {
                if (is) {
                    if (s == 2) {
                        this.router.navigate(['/upload'])
                    } else {
                        this.modal.open(PopTips, ['实名认证后才可以发布作品，请前往个人中心进行实名认证！', false])
                    }
                }

            })
        ).subscribe();

    }

    // toIndex(){
    //     this.router.navigate(['/']);
    // }
}
