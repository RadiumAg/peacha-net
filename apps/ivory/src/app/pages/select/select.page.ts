import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Works } from '@peacha-core';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { IndexApiService } from '../index/index-api.service';

@Component({
	selector: 'ivo-select-hh',
	templateUrl: './select.page.html',
	styleUrls: ['./select.page.less'],
})
export class SelectPage {
	constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private indexApi: IndexApiService) {}

	priceRegion = [
		{ sp: -1, ep: -1 },
		{ sp: 0, ep: 0 },
		{ sp: 0, ep: 500 },
		{ sp: 500, ep: 1000 },
		{ sp: 1000, ep: 2000 },
		{ sp: 2000, ep: 3000 },
		{ sp: 3000, ep: -1 },
	];
	page$ = new BehaviorSubject(1);
	works$ = this.route.queryParams.pipe(
		switchMap(r => {
			return this.http
				.get<{
					count: number;
					list: {
						id: number;
						name: string;
						likeCount: number;
						collectCount: number;
						publishTime: number;
						cover: string;
						category: number;
						userId: number;
						nickName: string;
						price: number;
						stock: number;
					}[];
				}>(
					// eslint-disable-next-line max-len
					`/work/search_work?p=${r.p ? r.p - 1 : 0}&s=20&o=${r.o ?? 1}&sp=${r.m ? this.priceRegion[r.m].sp : -1}&ep=${
						r.m ? this.priceRegion[r.m].ep : -1
					}&dd=${r.dd ?? 0}&c=${r.c === undefined ? '-1' : r.c}&ws=${this.router.url.includes('/select/work') ? -1 : 1}&ft=${
						r.ft === undefined ? '-1' : r.ft
					}
                    `
				)
				.pipe(
					tap(_s => {
						this.page$.next(r.p ?? 1);
					})
					// catchError((err) => of({ count: 0 }))
				);
		})
	);

	/**热门标签 */
	hotTags$ = this.indexApi.getHotTag();

	page(data: number): void {
		this.router.navigate([], {
			queryParams: {
				p: data,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}
}
