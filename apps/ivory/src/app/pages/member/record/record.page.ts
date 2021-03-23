import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { MemberApiService } from '../member-api.service';

@Component({
	selector: 'ivo-record',
	templateUrl: './record.page.html',
	styleUrls: ['./record.page.less'],
})
export class RecordPage {
	constructor(
		private memberApi: MemberApiService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	key: FormControl = new FormControl('');
	keyword$ = new BehaviorSubject<string>('');
	page$ = new BehaviorSubject<number>(1);

	record$ = this.route.queryParams.pipe(
		switchMap(r => {
			return this.memberApi.getSellOrder(r.key, r.p, 5, 0).pipe(
				tap(_ => {
					this.page$.next(r.p ?? 1);
				})
			);
		})
	);

	keyword() {
		this.keyword$.next(this.key.value);
		this.router.navigate([], {
			queryParams: {
				k: this.key.value,
				p: 1,
			},
			queryParamsHandling: 'merge',
		});
	}

	page(data: number) {
		this.router.navigate([], {
			queryParams: {
				p: data,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}
}
