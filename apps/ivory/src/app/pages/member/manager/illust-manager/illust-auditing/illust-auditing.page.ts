import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { SharedService } from '../../live-manager/live.service';

type ProductionTwo = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		category: number;
		auditresult: string;
		submittime: string;
		audittime: string;
	}[];
};
@Component({
	selector: 'ivo-illust-auditing',
	templateUrl: './illust-auditing.page.html',
	styleUrls: ['./illust-auditing.page.less'],
})
export class IllustAuditingPage {
	showList = [];
	key: FormControl = new FormControl('');
	update$ = new BehaviorSubject(true);
	currentPage$ = new BehaviorSubject(1);


	works$ = combineLatest([this.route.queryParams, this.update$]).pipe(
		switchMap(([params, _i]) => {
			return this.http
				.get<ProductionTwo>(`/work/get_apply_works?k=${params.k ?? ''}&p=${params.p ? params.p - 1 : 0}&s=6&c=1&a=0`)
				.pipe(
					tap(s => {
						this.showList = s.list;
						this.currentPage$.next(params.p ?? 1);
					})
				);
		})
	);
	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private _sharedService: SharedService) { }

	params$ = this.route.queryParams.pipe(
		tap(params => {
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
}
