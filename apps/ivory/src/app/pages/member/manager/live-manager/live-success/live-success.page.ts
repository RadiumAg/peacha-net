import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SharedService } from '../live.service';
import { MemberApiService } from '../../../member-api.service';


@Component({
	selector: 'ivo-live-success',
	templateUrl: './live-success.page.html',
	styleUrls: ['./live-success.page.less'],
})
export class LiveSuccessPage {
	currentPage$ = new BehaviorSubject(1);
	m: FormControl = new FormControl(-1);
	key: FormControl = new FormControl('');
	showList = [];

	update$ = new BehaviorSubject<boolean>(true);

	works$ = combineLatest([this.update$, this.route.queryParams]).pipe(
		switchMap(([_up, params]) => {
			return this.memberApi.getCreateWork(params.k, params.p, 6, 0)
				.pipe(
					tap(s => {
						this.showList = s.list;
						this.currentPage$.next(params.p ?? 1);
						s.list.map(l => {
							l.time = l.publishtime + 7 * 24 * 60 * 60 * 1000 - Date.now();
						});
					})
				);


		})
	);
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private _sharedService: SharedService,
		private memberApi: MemberApiService
	) { }


	b = this.m.valueChanges
		.pipe(
			switchMap(m => {
				return this.router.navigate([], {
					queryParams: { m },
					queryParamsHandling: 'merge',
				});
			})
		)
		.subscribe();

	params$ = this.route.queryParams.pipe(
		tap(params => {
			this.m.setValue(params.m);
			this.key.setValue(params.k);
		})
	);

	keyword() {
		this.router.navigate([], {
			queryParams: {
				k: this.key.value,
				p: 1,
			},
			queryParamsHandling: 'merge',
		});
	}

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

	changePage() {
		this.router.navigate([], {
			queryParams: {
				p: 1,
			},
			queryParamsHandling: 'merge',
		});
	}
}
