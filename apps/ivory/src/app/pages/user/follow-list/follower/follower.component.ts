import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap, catchError } from 'rxjs/operators';

@Component({
	selector: 'ivo-follower',
	templateUrl: './follower.component.html',
	styleUrls: ['./follower.component.less'],
})
export class FollowerComponent {
	current$: Observable<{
		count: number;
		list: {
			id: number;
			nickname: string;
			description: string;
			avatar: string;
			follow_state: number;
		}[];
	}>;
	currentPage$ = new BehaviorSubject<number>(0);
	constructor(http: HttpClient, route: ActivatedRoute, private router: Router) {
		this.current$ = combineLatest([route.parent.params, route.queryParams]).pipe(
			switchMap(([p, params]) => {
				return http.get<any>(`/user/get_follower_list?u=${p.id}&p=${params.page ? params.page - 1 : 0}&s=10`).pipe(
					tap(_ => {
						this.currentPage$.next(params.page ?? 1);
					})
				);
			}),
			catchError(_e => {
				return of({
					count: 0,
					list: [],
				});
			})
			// tap(t => {
			//   console.log(t);
			// })
		);
	}

	toPage(i: number) {
		this.router.navigate([], {
			queryParams: {
				page: i,
			},
		});
		document.documentElement.scrollTop = 0;
	}
}
