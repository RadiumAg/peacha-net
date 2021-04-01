import { Component } from '@angular/core';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';

@Component({
	selector: 'ivo-buy-order-detail',
	templateUrl: './buy-order-detail.page.html',
	styleUrls: ['./buy-order-detail.page.less'],
})
export class BuyOrderDetailPage {
	constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private modal: ModalService) { }
	update$ = new BehaviorSubject<number>(0);
	id$ = new BehaviorSubject<string[]>([]);
	work$: Observable<{
		orderid: number;
		workid: number;
		work_name: string;
		work_cover: string;
		price: number;
		sellerid: number;
		seller_name: string;
		createtime: string;
		completetime: string;
		transaction_id: number;
		pay_type: number;
		category: number;
		sell_type: number;
		state: number;
	}> = combineLatest([this.route.params, this.update$]).pipe(
		switchMap(r => {
			return this.http.get<any>(`/mall/get_buy_order_detail?o=${r[0].id}`);
		}),
		tap(a => {
			this.id$.next([a.orderid]);
		})
	);

	cancel(orderid: number) {
		this.modal
			.open(PopTips, ['是否确定取消订单?', true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.http.post('/mall/cancel_order', { o: [orderid] }).subscribe(() => {
						this.update$.next(1);
					});
				}
			});
	}

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else if (c == 0) {
			this.router.navigate(['live2d', id]);
		} else {
			this.router.navigate(['3d', id]);
		}
	}
	goback() {
		this.route.queryParams.subscribe(s => {
			if (s.jk) {
				this.router.navigate(['/setting/order']);
			} else {
				history.go(-1);
			}
		});
	}

	// tag：0结算 1确认删除  2删除待支付 3删除退款中 4全部确认删除
	// 1 4 传入orderid
	delet(item: any) {
		if (item.state == 0) {
			this.modal.open(PopTips, ['待支付或退款中,订单无法删除，支付完毕或取消才可删除', false]);
		} else if (item.state == 4) {
			this.modal.open(PopTips, ['退款中,订单无法删除，需退款完毕后才可删除', false]);
		} else {
			this.modal
				.open(PopTips, ['是否确认删除订单，订单删除后无法找回', true])
				.afterClosed()
				.subscribe(s => {
					if (s) {
						this.http.post('/mall/delete_order', { o: [item.orderid] }).subscribe(_ => {
							this.router.navigate(['/setting/order']);
						});
					}
				});
		}
	}

	toPay(id: number) {
		this.http
			.post<{ trade_id: number }>('/mall/initiate_transaction', {
				o: [id],
			})
			.subscribe(s => {
				this.router.navigate(['../pay'], {
					queryParams: {
						tradeId: s.trade_id,
						a: 1,
						orderId: JSON.stringify([id]),
					},
				});
			});
	}

	orderTimeout() {
		this.update$.next(1);
	}
}
