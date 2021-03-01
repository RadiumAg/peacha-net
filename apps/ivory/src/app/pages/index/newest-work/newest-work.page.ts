import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, empty, fromEvent, Subscription } from 'rxjs';
import { tap, take, switchMap, filter, startWith, mergeMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

type Newest = {
	count: number,
	list: {
		id: number;
		public_date: number;
		public_userid: number;
		public_username: string;
		public_useravatar: string;
		work: {
			work_id: number;
			work_name: string;
			description: string;
			collect_count: number;
			state: number;
			cover: string;
			type: number;
		};
	}[];
};
@Component({
	selector: 'ivo-newest-work',
	templateUrl: './newest-work.page.html',
	styleUrls: ['../reuse.less'],
})
export class NewestWorkPage {
	count = 0;
	cache = [];
	private page = 1;
	loading = false;

	constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

	private loadByScroll$ = fromEvent(window, 'scroll').pipe(
		filter(() => {
			return (
				window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight * 0.8 &&
				(this.cache.length % 20 === 0)
			);
		}),
		filter(() => !this.loading) // 防止加载过程中滚动事件触发多次加载
	);

	loadedItems$ = this.loadByScroll$.pipe(
		startWith(1), //页面首次加载触发
		mergeMap(() => {
			this.loading = true;
			return this.http.get<Newest>(`/news/newest?page=${this.page - 1}&size=20`).pipe(
				tap(res => {
					this.count = res.count;
					this.cache = [...this.cache, ...res.list];
					this.page++;
					this.loading = false;
				}),
				map(() => this.cache)
			);
		})
	);

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
