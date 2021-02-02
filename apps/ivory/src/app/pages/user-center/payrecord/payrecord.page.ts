import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { TradeApiService } from '../../pay/trade-api.service';

@Component({
	selector: 'ivo-payrecord',
	templateUrl: './payrecord.page.html',
	styleUrls: ['./payrecord.page.less'],
})
export class PayrecordPage implements OnInit {
	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private tradeApi: TradeApiService) {}

	ngOnInit(): void {}
	key = new FormControl(null);
	date = new FormControl(null);
	page$ = new BehaviorSubject<number>(0);

	wallet$ = combineLatest([this.route.queryParams]).pipe(
		switchMap(([r]) => {
			const time = this.date.value ? formatDate(this.date.value as Date, 'yyyy-MM-dd', 'zh-cn') : '';
			return this.tradeApi
				.queryPayLists(time, r.p ? r.p - 1 : 0, 10)

				.pipe(
					tap(s => {
						this.page$.next(r.p ?? 1);
					})
				);
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
	handleDatePanelChange(mode: string): void {
		console.log(1);
		this.router.navigate([], {
			queryParams: {
				m: this.date.value,
			},
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
