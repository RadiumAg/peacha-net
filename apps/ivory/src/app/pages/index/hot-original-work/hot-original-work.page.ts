import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, empty, Subscription } from 'rxjs';
import { tap, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

type HotWork = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		like_count: number;
		collect_count: number;
		price: number;
		state: number;
		nickname: string;
		category: number;
	}[];
};
@Component({
	selector: 'ivo-hot-original-work',
	templateUrl: './hot-original-work.page.html',
	styleUrls: ['../reuse.less'],
})
export class HotOriginalWorkPage {
	subscription: Subscription;
	pageOriginalWork$ = new BehaviorSubject<number>(1);
	hotOriginalWorkList: Array<any> = [];
	count$ = new BehaviorSubject<number>(0);

	/**热门原画作品 */
	hotOriginalWork$ = this.http.get<HotWork>(`/work/hot_work?p=0&s=20&c=1`).pipe(
		tap(s => {
			s.list.map(l => {
				this.hotOriginalWorkList.push(l);
			});
			this.pageOriginalWork$.next(1);
			this.count$.next(s.count);
		})
	);

	constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}

	@HostListener('window:scroll', ['$event']) public scrolled($event: Event) {
		if (document.documentElement.scrollHeight - document.documentElement.scrollTop == document.documentElement.clientHeight) {
			combineLatest(this.count$, this.pageOriginalWork$)
				.pipe(
					take(1),
					switchMap(([c, s]) => {
						if (c > this.hotOriginalWorkList.length) {
							return this.http.get<HotWork>(`/work/hot_work?p=${s}&s=20&c=1`).pipe(
								tap(l => {
									l.list.map(a => {
										this.hotOriginalWorkList.push(a);
									});
									this.pageOriginalWork$.next(s + 1);
									this.cdr.markForCheck();
								})
							);
						}
						return empty();
					})
				)
				.subscribe();
		}
	}

	toUser(id: number) {
		this.router.navigate(['user', id]);
	}
}
