import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ShopMallApiService } from '@peacha-core';
import { Steps } from '@peacha-core/components';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';

type PayMentList = {
	id: number,
	buyerId: number,
	sellerId: number,
	remarks: string,
	payId: string,
	channel: string,
	createTime: number,
	completeTime: number,
	expressFee: number,
	discountAmount: number,
	amount: number,
	hasExpress: boolean,
	name: string,
	platform: string,
	serviceName: string,
	status: number,
	goods: {
		id: number,
		category: {
			id: number,
			name: string,
			jumpPage: string
		},
		name: string,
		sourceId: string,
		price: number,
		count: number,
		remarks: string,
		types: string,
		expressNumber: string,
		expressType: string
	}
}[];

@Component({
	selector: 'ivo-commission-payment-history',
	templateUrl: './commission-payment-history.page.html',
	styleUrls: ['./commission-payment-history.page.less'],
})
export class CommissionPaymentHistoryPage implements OnInit {
	@ViewChild(Steps) steps: Steps;

	identity: number;

	commissionFinalprice: number;

	stopTime: number;

	payList: PayMentList;

	refundList: PayMentList;

	detailList: {
		expectRate: number;
		amount: number;
		rateType: number;
	}[];

	actualPayment = 0;

	constructor(
		private detail: CommissionDetailService,
		private api: CommissionApiService,
		private cdr: ChangeDetectorRef,
		private shopApi: ShopMallApiService
	) { }

	ngOnInit(): void {
		this.identity = this.detail.getIdentity();
		this.commissionFinalprice = Number(this.detail.getDetailValue().commission.finalPrice);
		this.stopTime =
			Number(this.detail.getDetailValue().commission.publishTime) + this.detail.getDetailValue().commission.day * 24 * 60 * 60 * 1000;


		this.shopApi.goodsList('20,21,22,23', this.detail.getCommissionId(), 4, 0, 50).subscribe(s => {
			console.log(s);
			if (this.identity === 1) {
				this.payList = s.list.filter(l => l.goods.category.id != 20);
				this.refundList = s.list.filter(l => l.goods.category.id == 22);

				//用于退款详情显示实际支付稿酬
				s.list.filter(l => l.goods.category.id == 21 || l.goods.category.id == 23).forEach(o => {
					this.actualPayment = this.actualPayment + o.amount;
				})

			} else {
				this.payList = s.list.filter(l => l.goods.category.id == 20);
			}


			this.api.orderDetails(this.detail.getCommissionId()).subscribe(a => {
				this.detailList = a.list;
				this.cdr.detectChanges();
				this.detailList?.forEach(d => {
					if (d.rateType === 1 && this.refundList?.length > 0) {
						this.stopTime =
							Math.floor((Number(this.refundList[0]?.completeTime) - this.stopTime) / 1000 / 60 / 60 / 24) === 0
								? 1
								: Math.floor((Number(this.refundList[0]?.completeTime) - this.stopTime) / 1000 / 60 / 60 / 24);
					}
				});
			});
			this.cdr.detectChanges();
		})

	}
}
