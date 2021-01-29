import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState } from '@peacha-core';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
	selector: 'ivo-blacklist',
	templateUrl: './blacklist.page.html',
	styleUrls: ['./blacklist.page.less'],
})
export class BlacklistPage implements OnInit, OnDestroy {
	@Select(UserState.id)
	id$: Observable<number>;

	uid: number;
	page: number;

	list: {
		id: number;
		nickname: string;
		description: string;
		avatar: string;
		blacktime: number;
	}[] = [];

	count = 0;

	change$ = new BehaviorSubject(0);

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private scrollDispatcher: ScrollDispatcher,
		private router: Router
	) {
		this.id$.subscribe(s => {
			this.uid = s;
		});
	}

	scroll$ = this.scrollDispatcher
		.scrolled()
		.pipe(
			tap(scrollable => {
				if (scrollable) {
					const scroll = scrollable as CdkScrollable;
					if (scroll.measureScrollOffset('bottom') <= 0) {
						if (this.count > this.list.length) {
							this.router.navigate([], {
								queryParams: {
									page: Number(this.page) + 1,
								},
								queryParamsHandling: 'merge',
							});
						}
					}
				}
			})
		)
		.subscribe();

	blackList$ = combineLatest([this.route.queryParams, this.change$]).pipe(
		switchMap(([p, c]) => {
			if (p.page) {
				return this.http
					.get<{
						count: number;
						list: {
							id: number;
							nickname: string;
							description: string;
							avatar: string;
							blacktime: number;
						}[];
					}>(`/user/get_black_list?u=${this.uid}&p=${p.page}&s=10`)
					.pipe(
						tap(s => {
							this.count = s.count;
							this.page = p.page ?? 0;
							s.list.forEach(l => {
								if (this.list.filter(a => a.id === l.id).length === 0) {
									this.list.push(l);
								}
							});
						})
					);
			} else {
				return EMPTY;
			}
		})
	);

	ngOnInit(): void {
		this.router.navigate([], {
			queryParams: {
				page: 0,
			},
			queryParamsHandling: 'merge',
		});
	}

	cancelBlack(id: number): void {
		this.http.get(`/user/black?u=${id}`).subscribe(s => {
			this.list = this.list.filter(l => l.id != id);
			this.change$.next(1);
		});
	}

	ngOnDestroy(): void {
		this.scroll$.unsubscribe();
	}
}
