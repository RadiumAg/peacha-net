import { Directive, Input, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, take, tap } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { UserState } from '../../core/state/user.state';

@Directive({
	selector: '*[ivo-work-like]',
	exportAs: 'worklike',
})
export class WorkLikeDirective {
	work$ = new BehaviorSubject<number>(0);
	like$ = new BehaviorSubject<ELikeState>(0);

	// eslint-disable-next-line @angular-eslint/no-input-rename
	@Input('work')
	set work(
		v: {
			id: number;
			isLike: number;
			likeCount: number;
			isCollect: number;
			collectCount: number
		}) {
		this.work$.next(v.id);
		this.like$.next(v.isLike);
	}

	@Select(UserState.id)
	id$: Observable<number>;

	constructor(private http: HttpClient, private store: Store, private router: Router, private platform: PlatformLocation) { }

	@HostListener('click')
	request() {
		combineLatest([this.like$, this.work$, this.id$])
			.pipe(
				take(1),
				switchMap(([state, work, id]) => {
					if (id > 0) {
						return this.http.post(`/work/like_work`, { w: work }).pipe(
							tap((v: {}) => {
								if (state == ELikeState.None) {
									return this.like$.next(ELikeState.Liked);
								} else {
									return this.like$.next(ELikeState.None);
								}
							})
						);
					} else {
						this.router.navigate(['/passport/login'], {
							queryParams: {
								return: this.platform.pathname,
							},
						});
						return EMPTY;
					}
					// if (state == EFollowState.None) {
					//     this.requesting$.next(true);
					//     return this.http.get<any>(`/user/follow?u=${user}`).pipe(
					//         tap((v:{
					//             follow_state:number
					//         }) => {
					//             // TODO
					//             this.follow$.next(v.follow_state);
					//         })
					//     );
					// } else {
					//     return this.http.get(`/user/unfollow?u=${user}`).pipe(
					//         tap(_ => {
					//             this.follow$.next(EFollowState.None)
					//         })
					//     );
					// }
				})
				// tap(_ => {
				//     this.requesting$.next(false);
				// })
			)
			.subscribe(_ => {
				// fire and forget
			});
	}
}

export enum ELikeState {
	None = 0,
	Liked = 1,
}
