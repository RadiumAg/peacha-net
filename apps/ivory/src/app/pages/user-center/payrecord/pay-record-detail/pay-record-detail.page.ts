import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TradeApiService } from '../../../pay/trade-api.service';

@Component({
	selector: 'ivo-pay-record-detail',
	templateUrl: './pay-record-detail.page.html',
	styleUrls: ['./pay-record-detail.page.less'],
})
export class PayRecordDetailPage {
	constructor(
		private tradeapi: TradeApiService,
		private router: ActivatedRoute,
		private http: HttpClient
	) { }

	detail$ = combineLatest([this.router.params]).pipe(
		switchMap(([r]) => {
			return this.tradeapi.queryPayDetails(r.payid);
		})
	);

	toOrderDetail(targetRoute: string, requestUrl: string, id: string) {
		if (requestUrl) {
			this.http.get<{
				goods: {
					sourceId: string,
				}[]
			}>(requestUrl.split('{orderId}')[0] + id).subscribe(s => {
				window.open(location.origin + targetRoute.split('?id')[0] + '?id=' + s.goods[0].sourceId);

			})

		} else {
			window.open(location.origin + targetRoute.split('{orderId}')[0] + (targetRoute.split('{orderId}').length === 2 ? id : ''));
		}
	}
}
