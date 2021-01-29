import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SharedService } from '../../live-manager/live.service';

type Production = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		type: number;
		publishtime: number;
		state: number;
		time: number;
		is_cooperates: number;
	}[];
};
@Component({
	selector: 'ivo-illust-success',
	templateUrl: './illust-success.page.html',
	styleUrls: ['./illust-success.page.less'],
})
export class IllustSuccessPage {
	showList: any = [];
	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private _sharedService: SharedService) {}

	update$ = new BehaviorSubject(true);
	currentPage$ = new BehaviorSubject(1);

	works$ = combineLatest(this.update$, this.route.queryParams).pipe(
		switchMap(([up, params]) => {
			return this.http
				.get<Production>(`/work/get_create_illustration?k=${params.k ?? ''}&p=${params.p ? params.p - 1 : 0}&s=6&n=-1`)
				.pipe(
					tap(s => {
						this.showList = s.list;
						s.list.map(l => {
							l.time = l.publishtime + 7 * 24 * 60 * 60 * 1000 - Date.now();
						});
						this.currentPage$.next(params.p ?? 1);
					})
				);
		})
	);
	toPage(p: number) {
		this.router.navigate([], {
			queryParams: {
				p: p,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}

	changePage() {
		this.router.navigate([], {
			queryParams: {
				p: 1,
			},
			queryParamsHandling: 'merge',
		});
	}

	ll(i: boolean) {
		if (i) {
			if (this.showList.length == 1 && this.currentPage$.value > 1) {
				this.toPage(this.currentPage$.value - 1);
				this._sharedService.emitChange(1);
			} else {
				this.update$.next(false);
				this._sharedService.emitChange(1);
			}
		}
	}
}
