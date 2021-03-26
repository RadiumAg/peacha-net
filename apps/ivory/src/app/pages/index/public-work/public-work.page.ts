import { Component } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { IndexApiService } from '../index-api.service';


@Component({
	selector: 'ivo-public-work',
	templateUrl: './public-work.page.html',
	styleUrls: ['../reuse.less'],
})
export class PublicWorkPage {
	pagePublicWork$ = new BehaviorSubject<number>(0);
	publicWorkList: Array<any> = [];
	currentPage$ = new BehaviorSubject<number>(1);

	/**公示期作品 */
	publicWork$ = this.route.queryParams.pipe(
		switchMap(s => {
			return this.indexApi.getPublicWork(s.page - 1 ?? 0, 20).pipe(
				tap(_l => {
					this.currentPage$.next(s.page ?? 1);
				}),
				catchError(_e => {
					return of({
						count: 0,
						list: [],
					});
				})
			);
		})
	);
	constructor(
		private router: Router,
		private indexApi: IndexApiService,
		private route: ActivatedRoute
	) { }

	toPagePublic(p: number) {
		this.router.navigate([], {
			queryParams: {
				page: p,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}


}
