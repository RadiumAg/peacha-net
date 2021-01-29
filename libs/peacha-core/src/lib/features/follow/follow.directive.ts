import { Directive, Input, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, empty, Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Store, Select, State } from '@ngxs/store';
import { PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';
import { PopTips } from '../../components/pop-tips/pop-tips';
import { UserState, ModalService } from '../../core';

@Directive({
	selector: '*[ivo-follow]',
	exportAs: 'follow',
})
export class FollowDirective {
	user$ = new BehaviorSubject<number>(0);
	follow$ = new BehaviorSubject<EFollowState>(0);
	isCancel$ = new BehaviorSubject(false);
	// requesting$ = new BehaviorSubject<boolean>(false);

	@Input('follow-id')
	set user(v: number) {
		this.user$.next(v);
	}

	@Input('follow-state')
	set state(v: EFollowState) {
		this.follow$.next(v);
	}

	@Select(UserState.id)
	id$: Observable<number>;

	constructor(
		private http: HttpClient,
		private store: Store,
		private router: Router,
		private platform: PlatformLocation,
		private modal: ModalService
	) {}

	@HostListener('click')
	request() {
		combineLatest([this.id$, this.user$, this.follow$])
			.pipe(
				take(1),
				tap(([id, user, state]) => {
					if (id > 0) {
						if (id == user) {
							let a = '不能够自己关注自己哦！';
							this.modal.open(PopTips, [a, false]);
							return empty();
						} else {
							if (state === 1 || state === 2) {
								this.modal
									.open(PopTips, ['是否取消关注？', true])
									.afterClosed()
									.subscribe(i => {
										if (i) {
											return this.http
												.get(`/user/follow?u=${user}`)
												.pipe(
													tap((v: { follow_state: number }) => {
														if (state == EFollowState.None) {
															return this.follow$.next(v.follow_state);
														} else {
															return this.follow$.next(EFollowState.None);
														}
													})
												)
												.subscribe();
										} else {
											return empty();
										}
									});
							} else if (state === 0) {
								return this.http
									.get(`/user/follow?u=${user}`)
									.pipe(
										tap((v: { follow_state: number }) => {
											if (state == EFollowState.None) {
												return this.follow$.next(v.follow_state);
											} else {
												return this.follow$.next(EFollowState.None);
											}
										})
									)
									.subscribe();
							}
						}
					} else {
						this.router.navigate(['/passport/login'], {
							queryParams: {
								return: this.platform.pathname,
							},
						});
						return empty();
					}
				})
			)
			.subscribe();

		// combineLatest(
		//     this.follow$,
		//     // this.requesting$,
		//     this.user$,
		//     this.id$,
		// ).pipe(
		//     take(1),
		//     switchMap(([state, user, id]) => {
		//         if (id > 0) {
		//             if (user == id) {
		//                 let a = "不能够自己关注自己哦！"
		//                 this.modal.open(PopTips, [a, false])
		//                 return empty();
		//             } else {
		//                         return this.http.get(`/user/follow?u=${user}`).pipe(
		//                             tap((v: {
		//                                 follow_state: number
		//                             }) => {

		//                                 if (state == EFollowState.None) {
		//                                     return this.follow$.next(v.follow_state);
		//                                 } else {
		//                                     return this.follow$.next(EFollowState.None);
		//                                 }

		//                             })
		//                         );
		//             }
		//         } else {
		//             this.router.navigate(['/passport/login'], {
		//                 queryParams: {
		//                     return: this.platform.pathname
		//                 }
		//             });
		//             return empty();
		//         }

		//     }),
		//     // tap(_ => {
		//     //     this.requesting$.next(false);
		//     // })
		// ).subscribe(_ => {
		//     console.log(_)
		//     // fire and forget
		// });
	}
}

export enum EFollowState {
	None = 0,
	Following = 1,
	Each = 2,
	Black = 3,
}
