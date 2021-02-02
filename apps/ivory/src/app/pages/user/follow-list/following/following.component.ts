import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

@Component({
	selector: 'ivo-following',
	templateUrl: './following.component.html',
	styleUrls: ['./following.component.less'],
})
export class FollowingComponent {
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
		this.current$ = combineLatest(route.parent.params, route.queryParams).pipe(
			switchMap(([p, params]) => {
				return http.get<any>(`/user/get_following_list?u=${p.id}&p=${params.page ? params.page - 1 : 0}&s=10`).pipe(
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
