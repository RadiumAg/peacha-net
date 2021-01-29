import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

type List = {
	count: number;
	list: {
		id: number;
		workid: number;
		cover: string;
		name: string;
		publishtime: number;
		count: number;
		time: number;
		nickname: string;
	}[];
};
@Component({
	selector: 'ivo-cooperate',
	templateUrl: './cooperate-work.page.html',
	styleUrls: ['./cooperate-work.page.less'],
})
export class CooperateWorkPage {
	params$: Observable<{ [a: string]: any }> = this.route.queryParams;

	currentPage$ = new BehaviorSubject<number>(0);

	goodslist$ = this.route.queryParams.pipe(
		switchMap(params => {
			if (params.promoter == 1 || params.promoter == null) {
				return this.http.get<List>(`/work/get_launch_work?p=${params.page ? params.page - 1 : 0}&s=4&a=${params.a ?? 1}`).pipe(
					tap(s => {
						this.currentPage$.next(params.page ?? 1);
						if (params.a == 0) {
							s.list.map(l => {
								l.time = 561600000 + Number(l.publishtime) - Date.now();
							});
						}
					})
				);
			} else {
				return this.http.get<List>(`/work/get_participate_work?p=${params.page ? params.page - 1 : 0}&s=4&a=${params.a ?? 1}`).pipe(
					tap(s => {
						this.currentPage$.next(params.page ?? 1);
						if (params.a == 0) {
							s.list.map(l => {
								l.time = 561600000 + Number(l.publishtime) - Date.now();
							});
						}
					})
				);
			}
		})
	);
	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

	addParamsOne(id: number) {
		this.router.navigate([], {
			queryParams: {
				promoter: id,
				page: 1,
			},
			queryParamsHandling: 'merge',
		});
	}

	addParamsTwo(id: number) {
		this.router.navigate([], {
			queryParams: {
				a: id,
				page: 1,
			},
			queryParamsHandling: 'merge',
		});
	}

	toPage(p: number) {
		this.router.navigate([], {
			queryParams: {
				page: p,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}
}
