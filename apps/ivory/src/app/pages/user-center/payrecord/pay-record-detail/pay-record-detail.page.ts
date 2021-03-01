import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShopMallApiService } from '@peacha-core';
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
		private shopApi: ShopMallApiService
	) { }

	detail$ = combineLatest([this.router.params]).pipe(
		switchMap(([r]) => {
			return this.tradeapi.queryPayDetails(r.payid);
		})
	);

	toOrderDetail(i: string, p: string, id: string) {
		if (i.includes('企划')) {
			this.shopApi.orderDetail(id).subscribe(s => {
				window.open(location.origin + '/commission/detail/payment?id=' + s.goods[0].sourceId);
			})
		} else {
			window.open(p);
		}
	}
}
