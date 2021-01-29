import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, map, distinctUntilChanged, catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Works } from '@peacha-core';

@Component({
	selector: 'ivo-works',
	templateUrl: './works.page.html',
	styleUrls: ['./works.page.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksPage {
	cid: FormControl = new FormControl(-1);
	wsid: FormControl = new FormControl(-1);

	cid$ = this.cid.valueChanges
		.pipe(
			tap(o => {
				this.router.navigate([], {
					queryParams: {
						c: o,
						page: 1,
					},
					queryParamsHandling: 'merge',
				});
			})
		)
		.subscribe();

	wsid$ = this.wsid.valueChanges
		.pipe(
			tap(o => {
				this.router.navigate([], {
					queryParams: {
						ws: o,
						page: 1,
					},
					queryParamsHandling: 'merge',
				});
			})
		)
		.subscribe();

	addParams(k: string) {
		this.router.navigate([], {
			queryParams: {
				k: k,
				page: 1,
			},
			queryParamsHandling: 'merge',
		});
	}
	works$: Observable<Works> = combineLatest(this.route.parent!.params, this.route.parent!.queryParams).pipe(
		distinctUntilChanged(),
		switchMap(([U, params]) => {
			return this.http
				.get<any>(
					`/work/get_works?u=${U.id}&p=${params.page ? params.page - 1 : 0}&k=${params.k ?? ''}&s=20&c=${params.c ?? -1}&ws=${
						params.ws ?? -1
					}`
				)
				.pipe(
					tap(s => {
						this.currentPage$.next(params.page ?? 1);
						this.cdr.markForCheck();
						if (s.list.length === 0) {
							this.error$.next(true);
						} else {
							this.error$.next(false);
						}
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

	error$ = new BehaviorSubject<boolean>(false);
	refresh$ = new BehaviorSubject<number>(0);
	currentPage$ = new BehaviorSubject<number>(1);

	oId$ = this.route.parent!.queryParamMap.pipe(
		map(q => {
			return parseInt(q.get('o') ?? '0') ?? 0;
		})
	);
	zId$ = this.route.parent!.queryParamMap.pipe(
		map(q => {
			return parseInt(q.get('z') ?? '-1') ?? 0;
		})
	);
	tId$ = this.route.parent!.queryParamMap.pipe(
		map(q => {
			return parseInt(q.get('t') ?? '-1') ?? 0;
		})
	);

	constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) {}

	toPage(p: number) {
		this.router.navigate([], {
			queryParams: {
				page: p,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}

	like(id: number) {
		this.http
			.post<void>(`/work/like_work`, {
				w: id,
			})
			.subscribe(_ => {
				this.refresh$.next(0);
			});
	}

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}
}

function compare(a: Array<any>, b: Array<any>): boolean {
	for (let i = 0; i < a.length; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}
