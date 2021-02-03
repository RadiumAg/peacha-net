import { Component } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'ivo-goodsearch',
	templateUrl: './goodsearch.page.html',
	styleUrls: ['./goodsearch.page.less'],
})
export class GoodsearchPage {
	constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

	page$ = new BehaviorSubject<number>(1);

	workdata$: Observable<{
		count: number;
		// eslint-disable-next-line @typescript-eslint/ban-types
		list: {};
	}> = this.route.queryParams.pipe(
		switchMap(r => {
			const key: string = encodeURIComponent(r.keyword ?? '');
			return this.http
				.get<any>(`/work/search_goods?k=${key ?? ''}&p=${r.p ? r.p - 1 : 0}&s=20&o=${r.o ? r.o : key ? 0 : 1}&dd=${r.dd ?? 0}`)
				.pipe(
					tap(_s => {
						this.page$.next(r.p ?? 1);
					}),
					catchError(_err => of({ count: 0 }))
				);
		})
	);

	toWork(id: number, c: number): void {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}

	toUser(id: number): void {
		this.router.navigate(['user', id]);
	}
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
