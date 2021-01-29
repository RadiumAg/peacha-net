import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';

type HotTag = {
	list: {
		name: string;
		color: string;
		id: number;
	}[];
};

type TagWork = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		like_count: number;
		price: number;
		nickname: string;
		category: number;
		userid: number;
		state: number;
	};
};

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
	hotTags$ = this.http.get<HotTag>(`/work/hot_tag`);

	/**标签作品 */
	works$ = this.route.queryParams.pipe(
		switchMap(s => {
			return this.http.get<TagWork>(`/work/tag_search?t=${s.id}&p=${s.page - 1 ?? 0}&s=20`).pipe(
				tap(l => {
					this.pageWorks$.next(s.page ?? 1);
				}),
				catchError(e => {
					return of({
						count: 0,
						list: [],
					});
				})
			);
		})
	);
	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

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
