import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent } from 'rxjs';
import { tap, filter, startWith, mergeMap, map } from 'rxjs/operators';
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
	count = 0;
	cache = [];
	private page = 1;
	loading = false;

	constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

	private loadByScroll$ = fromEvent(window, 'scroll').pipe(
		filter(() => {
			return (
				window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight * 0.8 &&
				(this.count === 0 || this.count > this.cache.length)
			);
		}),
		filter(() => !this.loading) // 防止加载过程中滚动事件触发多次加载
	);

	loadedItems$ = this.loadByScroll$.pipe(
		startWith(1), //页面首次加载触发
		mergeMap(() => {
			this.loading = true;
			return this.http.get<HotWork>(`/work/hot_work?p=${this.page - 1}&s=20&c=1`).pipe(
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
