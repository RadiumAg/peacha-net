import { Component } from '@angular/core';
import { fromEvent } from 'rxjs';
import { tap, filter, startWith, mergeMap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IndexApiService } from '../index-api.service';


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

	constructor(
		private indexApi: IndexApiService,
		private router: Router
	) { }

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
			return this.indexApi.getHotWork(this.page - 1, 20, 1, 0).pipe(
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

}
