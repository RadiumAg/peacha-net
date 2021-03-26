import { Component } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Works } from '@peacha-core';

@Component({
	selector: 'ivo-goodsearch',
	templateUrl: './goodsearch.page.html',
	styleUrls: ['./goodsearch.page.less'],
})
export class GoodsearchPage {
	constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

	page$ = new BehaviorSubject<number>(1);
	priceRegion = [
		{ sp: 0, ep: 0 },
		{ sp: 0, ep: 500 },
		{ sp: 500, ep: 1000 },
		{ sp: 1000, ep: 2000 },
		{ sp: 2000, ep: 3000 },
		{ sp: 3000, ep: '' },
	];
	workdata$ = this.route.queryParams.pipe(
		switchMap(r => {
			const key: string = encodeURIComponent(r.keyword ?? '');
			return this.http
				// eslint-disable-next-line max-len
				.get<Works>(`/work/search_work?k=${key}&p=${r.p ? r.p - 1 : 0}&s=20&o=${r.o ?? 1}&sp=${r.m ? this.priceRegion[r.m].sp : 0}&ep=${r.m ? this.priceRegion[r.m].ep : 0}&dd=${r.dd ?? 0}&c=${r.c === undefined ? '-1' : r.c}&ws=1&ft=${r.ft === undefined ? '-1' : r.ft}
				`)
				.pipe(
					tap(_s => {
						this.page$.next(r.p ?? 1);
					}),
					catchError(_err => of({ count: 0 }))
				);
		})
	);

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
