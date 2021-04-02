import { Component } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'ivo-work-search',
	templateUrl: './work-search.page.html',
	styleUrls: ['./work-search.page.less'],
})
export class WorkSearchPage {
	input$ = this.route.queryParams.pipe(
		map(s => {
			return s.keyword;
		})
	);

	constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

	sp: FormControl = new FormControl();
	ep: FormControl = new FormControl('', [Validators.maxLength(10)]);
	page$ = new BehaviorSubject<number>(1);

	sp$ = new BehaviorSubject<[number, number]>([0, 0]);
	workdata$: Observable<{
		count: number;
		// eslint-disable-next-line @typescript-eslint/ban-types
		list: {};
	}> = combineLatest([this.route.queryParams, this.sp$]).pipe(
		switchMap(([r, _sp]) => {
			const key: string = encodeURIComponent(r.keyword ?? '');
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
					`/work/search_work?k=${key}&p=${r.p ? r.p - 1 : 0}&s=20&o=${r.o ?? 1}&dd=${r.dd ?? 0}&c=${
						r.c === undefined ? '-1' : r.c
					}&ws=-1&ft=${r.ft === undefined ? '-1' : r.ft}
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

	price(): void {
		if (this.ep.hasError('maxlength')) {
		} else {
			this.sp$.next([this.sp.value ?? 0, this.ep.value ?? 0]);
		}
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
