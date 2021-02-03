import { Component } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, shareReplay, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { CanNot } from './can-not/can-not';
import { ModalService } from '@peacha-core';
import { RemoveFromCart } from '@peacha-core/state';

type GoodsInfo = {
	count: number;
	list: {
		workid: number;
		work_name: string;
		goodid: number;
		goods_name: string;
		cover: string;
		price: number;
		seller_id: number;
		seller_name: string;
		maxstock: number;
		description: string;
		salenumber: number;
		sellstate: number;
	}[];
};

@Component({
	selector: 'ivo-order',
	templateUrl: './order.page.html',
	styleUrls: ['./order.page.less'],
})
export class OrderPage {
	goods$: Observable<GoodsInfo> = this.route.queryParams.pipe(
		switchMap(params => {
			return this.http.post<GoodsInfo>('/mall/cart', {
				g: JSON.parse(params.order),
			});
		}),
		shareReplay()
	);

	total$ = this.goods$.pipe(
		map(goods => {
			return goods.list
				.map(o => o.price)
				.reduce((a, b) => {
					return a + b;
				}, 0);
		})
	);

	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private router: Router,
		private store: Store,
		private modal: ModalService
	) { }

	a: string;

	count = true;
	createOrder() {
		if (this.count) {
			combineLatest(this.goods$, this.route.queryParams)
				.pipe(
					take(1),
					switchMap(([_goods, params]) => {
						return this.http.post<{ list: Array<string> }>('/mall/create_order', {
							g: JSON.parse(params.order),
						});
					})
				)
				.subscribe(
					s => {
						// 从购物车中删除已创建订单的商品
						this.count = false;
						this.route.queryParams
							.pipe(
								switchMap(params => {
									return this.store.dispatch(new RemoveFromCart(JSON.parse(params.order)));
								})
							)
							.subscribe();
						// 生成交易号
						return this.http
							.post<{ trade_id: number }>('/mall/initiate_transaction', {
								o: s.list,
							})
							.subscribe(i => {
								this.router.navigate(['../pay'], {
									queryParams: {
										tradeId: i.trade_id,
										a: 0,
										orderId: JSON.stringify(s.list),
									},
								});
							});
					},
					e => {
						switch (e.code) {
							case 148:
								this.modal.open(CanNot, 1);
								// alert("商品已存在订单，请前往订单页面支付")
								break;
							case 145:
								this.modal.open(CanNot, 2);
								break;
						}
					}
				);
		}
	}
}
