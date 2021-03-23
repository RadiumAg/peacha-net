import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SharedService } from '../../live-manager/live.service';
import { MemberApiService } from '../../../member-api.service';

@Component({
	selector: 'ivo-illust-fail',
	templateUrl: './illust-fail.page.html',
	styleUrls: ['./illust-fail.page.less'],
})
export class IllustFailPage {
	key: FormControl = new FormControl('');
	showList = [];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private _sharedService: SharedService,
		private memberApi: MemberApiService,
	) { }
	update$ = new BehaviorSubject<boolean>(true);
	currentPage$ = new BehaviorSubject(0);

	params$ = this.route.queryParams.pipe(
		tap(params => {
			this.key.setValue(params.k);
		})
	);

	works$ = combineLatest([this.update$, this.route.queryParams]).pipe(
		switchMap(([_up, params]) => {
			return this.memberApi.getApplyWork(params.k, params.p, 6, 1, 2)
				.pipe(
					tap(s => {
						this.showList = s.list;
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
