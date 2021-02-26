import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { tap, take, switchMap } from 'rxjs/operators';

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
	selector: 'ivo-hot-live-work',
	templateUrl: './hot-live-work.page.html',
	styleUrls: ['../reuse.less'],
})
export class HotLiveWorkPage {
	pageLiveWork$ = new BehaviorSubject<number>(1);
	hotLiveWorkList: Array<any> = [];
	count: number;

	/**热门Live2D作品 */
	hotLiveWork$ = this.pageLiveWork$.pipe(
		take(1),
		switchMap(p => {
			return this.http.get<HotWork>(`/work/hot_work?p=${p}&s=20&c=0`).pipe(
				tap(s => {
					this.count = s.count;
					s.list.map(l => {
						this.hotLiveWorkList.push(l);
					});
					this.cdr.detectChanges();
				})
			);
		})
	).subscribe()

	constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

	@HostListener('window:scroll', ['$event']) public scrolled($event: Event) {
		/**
		 * 修复高分屏下拉滚动无效
		 * by kinori
		 * 2020/11/9
		 */

		if (document.documentElement.scrollHeight - document.documentElement.scrollTop == document.documentElement.clientHeight) {
			this.pageLiveWork$
				.pipe(
					take(1),
					switchMap((p) => {
						if (this.count > this.hotLiveWorkList.length) {
							return this.http.get<HotWork>(`/work/hot_work?p=${p}&s=20&c=0`).pipe(
								tap(l => {
									l.list.map(a => {
										this.hotLiveWorkList.push(a);
									});
									this.pageLiveWork$.next(p + 1);
									this.cdr.detectChanges();
								})
							);
						}
						return EMPTY;
					})
				)
				.subscribe();
		}
	}

	// @HostListener('click') click() {
	// 	console.log('哈哈哈哈')
	// }

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}
	toUser(id: number) {
		this.router.navigate(['user', id]);
	}
}
