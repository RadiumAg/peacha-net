import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { IndexApiService } from '../index-api.service';

@Component({
	selector: 'ivo-hot-tag',
	templateUrl: './hot-tag.page.html',
	styleUrls: ['../reuse.less'],
})
export class HotTagPage {
	pageWorks$ = new BehaviorSubject<number>(1);

	get tagName$() {
		return this.route.queryParams.pipe(map(s => s.k as string));
	}
	/**热门标签 */
	hotTags$ = this.indexApi.getHotTag();

	/**标签作品 */
	works$ = this.route.queryParams.pipe(
		switchMap(s => {
			return this.indexApi.getTagSearch(s.id, s.page - 1 ?? 0, 20).pipe(
				tap(() => {
					this.pageWorks$.next(s.page ?? 1);
				}),
				catchError(() => {
					return of({
						count: 0,
						list: [],
					});
				})
			);
		})
	);
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private indexApi: IndexApiService
	) { }

	searchWork(i: number, name: string) {
		this.router.navigate(['hotTagWork'], {
			queryParams: {
				id: i,
				k: name,
				page: 1,
			},
		});
	}

	toPagePublic(p: number) {
		this.router.navigate([], {
			queryParams: {
				page: p,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}

}
