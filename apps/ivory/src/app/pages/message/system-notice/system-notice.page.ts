import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';

type Detail = {
	id: number;
	news_type: number;
	source_id: number;
	details: string;
	public_time: string;
	title: string;
	one: string;
	two: string;
	three: string;
	four: string;
	catenationOne: string;
	catenationTwo: string;
	query: string;
};
@Component({
	selector: 'ivo-system-notice',
	templateUrl: './system-notice.page.html',
	styleUrls: ['./system-notice.page.less'],
})
export class SystemNoticePage implements OnDestroy {
	constructor(
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private scrollDispatcher: ScrollDispatcher
	) {}

	reg = new RegExp(/\{<@(?<link>[^>]*?)>(?<show>[^\}]*?)}/, 'ig');

	noticeList: Detail[] = [];
	noticeCount$ = new BehaviorSubject(null);
	page$ = new BehaviorSubject(0);

	notice$ = this.page$
		.pipe(
			withLatestFrom(this.noticeCount$),
			switchMap(([p, c]) => {
				if (c === 15 || p === 0) {
					return this.http.get<{ list: Detail[] }>(`/news/notice?page=${p}&size=15`).pipe(
						tap(s => {
							this.noticeCount$.next(s.list.length);
							s.list.map(l => {
								const arr = matchAll(l.details, this.reg);
								if (arr.length == 1) {
									l.one = l.details.substr(0, arr[0].index);
									l.four = arr[0].groups.show;
									l.catenationTwo = arr[0].groups.link?.split('?')[0];
									l.query = arr[0].groups.link?.split('=')[1];
								} else if (arr.length == 2) {
									l.one = l.details?.substr(0, arr[0].index);
									l.two = ' “' + arr[0].groups.show + '” ';
									l.catenationOne = arr[0].groups.link;
									l.three = l.details.split('}')[1].split('{')[0];
									l.four = arr[1].groups.show;
									l.catenationTwo = arr[1].groups.link?.split('?')[0];
									l.query = arr[1].groups.link?.split('=')[1];
								} else {
									l.one = l.details;
								}
								this.noticeList.push(l);
							});
							this.cdr.detectChanges();
						})
					);
				} else {
					return EMPTY;
				}
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
						if (this.noticeCount$.value === 15) {
							this.page$.next(this.page$.value + 1);
						}
					}
				}
			})
		)
		.subscribe();

	trackByIndex(index, item): void {
		return index;
	}

	toDetail(link: string): void {
		console.log(link);
		this.router.navigate([encodeURIComponent(link)]);
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
