import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

@Component({
	selector: 'ivo-user-search',
	templateUrl: './usersearch.page.html',
	styleUrls: ['./usersearch.page.less'],
})
export class UserSearchPage {
	constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

	page$ = new BehaviorSubject<number>(1);
	up$ = new BehaviorSubject<number>(0);

	userdata$: Observable<{
		count: number;
		// eslint-disable-next-line @typescript-eslint/ban-types
		list: {};
	}> = combineLatest([this.route.queryParams, this.up$]).pipe(
		switchMap(([r]) => {
			const key: string = encodeURIComponent(r.keyword ?? '');
			return this.http
				.get<any>(`/user/search?k=${key ?? ''}&p=${r.p ? r.p - 1 : 0}&s=10&o=${r.o ? r.o : key ? 0 : 1}&r=${r.r ?? -1}`)
				.pipe(
					tap(_s => {
						this.page$.next(r.p ?? 1);
					}),
					catchError(_err => of({ count: 0 }))
				);
		})
	);
	follow(data: number): void {
		this.http.get(`/user/follow?u=${data}`).subscribe(
			_s => { },
			_e => { }
		);
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

	toWork(id: number, c: number): void {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}
}
