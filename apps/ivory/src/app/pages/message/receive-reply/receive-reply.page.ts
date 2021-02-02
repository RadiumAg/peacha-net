import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState } from '@peacha-core';
import { Observable, BehaviorSubject, EMPTY } from 'rxjs';
import { withLatestFrom, switchMap, tap } from 'rxjs/operators';

type Detail = {
	id: number;
	news_type: number;
	source_id: number;
	details: string;
	centent: string;
	public_time: string;
	public_userid: number;
	public_username: string;
	public_useravatar: string;
	one: string;
	two: string;
	catenation: string;
};
@Component({
	selector: 'ivo-receive-reply',
	templateUrl: './receive-reply.page.html',
	styleUrls: ['./receive-reply.page.less'],
})
export class ReceiveReplyPage implements OnDestroy {
	@Select(UserState.avatar)
	useravatar$: Observable<string>;

	pageOne$ = new BehaviorSubject(0);

	constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private scrollDispatcher: ScrollDispatcher) { }

	reg = new RegExp(/\{<@(?<link>[^>]*?)>(?<show>[^}]*?)}/, 'ig');

	active$ = new BehaviorSubject(false);
	active = false;
	replyCount$ = new BehaviorSubject(null);
	replyList: Array<Detail> = [];

	reply$ = this.pageOne$
		.pipe(
			withLatestFrom(this.replyCount$),
			switchMap(([p, c]) => {
				if (c === 10 || p === 0) {
					return this.http.get<{ list: Detail[] }>(`/news/forum?page=${p}&size=10`).pipe(
						tap(s => {
							this.replyCount$.next(s.list.length);
							s.list.map(l => {
								const arr = matchAll(l.details, this.reg);
								l.two = arr[0].groups.show;
								l.catenation = arr[0].groups.link?.split('?')[0];
								switch (l.news_type) {
									case 300:
										l.one = l.details.substr(0, arr[0].index - 1);
										break;
									case 301:
										l.one = l.details.substr(0, arr[0].index);
										break;
								}
								this.replyList.push(l);
							});
							this.cdr.detectChanges();
						})
					);
				}
				return EMPTY;
			})
		)
		.subscribe();

	scroll$ = this.scrollDispatcher
		.scrolled()
		.pipe(
			tap(scrollable => {
				if (scrollable) {
					const scroll = scrollable as CdkScrollable;
					if (scroll.measureScrollOffset('bottom') <= 0) {
						if (this.replyCount$.value === 10) {
							this.pageOne$.next(this.pageOne$.value + 1);
						}
					}
				}
			})
		)
		.subscribe();

	reply(): void {
		this.active = true;
	}

	ngOnDestroy(): void {
		this.scroll$.unsubscribe();
	}
}

export function matchAll(str, reg): any {
	const res = [];
	let match;
	while ((match = reg.exec(str))) {
		res.push(match);
	}
	return res;
}
