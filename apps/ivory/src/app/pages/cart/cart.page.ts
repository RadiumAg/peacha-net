import { Component } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { take, map, tap, startWith, withLatestFrom, switchMap, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { UserState, ModalService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { RemoveFromCart } from 'libs/peacha-core/src/lib/core/state/cart.action';
import { CartState } from 'libs/peacha-core/src/lib/core/state/cart.state';

type GoodsInfo = {
	count: number;
	1;
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
		mark: number;
	}[];
};

@Component({
	selector: 'ivo-cart',
	templateUrl: './cart.page.html',
	styleUrls: ['./cart.page.less'],
})
export class CartPage {
	@Select(CartState.list)
	list$!: Observable<Array<number>>;

	@Select(UserState.id)
	id$: Observable<number>;

	@Select(UserState.phone)
	phone$: Observable<string>;

	checkArr$ = new BehaviorSubject<Set<number>>(new Set());

	goods$ = this.list$.pipe(
		switchMap(list => {
			return this.http.post<GoodsInfo>('/mall/cart', {
				g: list,
			});
		}),
		shareReplay()
	);

	validGoods$ = this.goods$.pipe(
		map(goods => {
			return goods.list.filter(o => {
				return o.sellstate == 1 && o.seller_id != this.uid && o.maxstock != o.salenumber && o.price != 0 && o.mark == 0;
			});
		})
	);

	invalidGoods$ = this.goods$.pipe(
		map(goods => {
			return goods.list.filter(o => {
				return o.sellstate == 0 || o.seller_id == this.uid || o.maxstock == o.salenumber || o.price == 0 || o.mark == 1;
			});
		})
	);

	uid: number;
	constructor(private http: HttpClient, private store: Store, private router: Router, private modal: ModalService) {
		this.id$.subscribe(s => {
			this.uid = s;
		});
	}

	total$ = this.checkArr$.pipe(
		withLatestFrom(this.goods$),
		map(([checkArr, goods]) => {
			return goods.list
				.filter(o => {
					return checkArr.has(o.goodid);
				})
				.map(o => o.price)
				.reduce((a, b) => {
					return a + b;
				}, 0);
		}),
		startWith(0)
	);

	allCheck(goods: Array<{ goodid: number }>) {
		this.checkArr$
			.pipe(
				take(1),
				map(s => {
					if (s.size === goods.length) {
						return new Set<number>();
					} else {
						return new Set(goods.map(u => u.goodid));
					}
				})
			)
			.subscribe(set => {
				this.checkArr$.next(set);
			});
	}

	checkOne(id: number) {
		this.checkArr$
			.pipe(
				take(1),
				map(s => {
					if (s.has(id)) {
						s.delete(id);
						return s;
					} else {
						s.add(id);
						return s;
					}
				})
			)
			.subscribe(set => {
				this.checkArr$.next(set);
			});
	}

	deleteOne(id: number) {
		const a = '确定要从购物车中删除吗？';
		this.modal
			.open(PopTips, [a, true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.store.dispatch(new RemoveFromCart([id]));
					this.checkArr$
						.pipe(
							take(1),
							tap(s => {
								if (s.has(id)) {
									s.delete(id);
								}
								return s;
							})
						)
						.subscribe(s => {
							this.checkArr$.next(s);
						});
				}
			});
	}

	deleteAll() {
		const a = '确定要从购物车中删除吗？';
		this.modal
			.open(PopTips, [a, true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.checkArr$
						.pipe(
							take(1),
							tap(checkArr => {
								this.store.dispatch(new RemoveFromCart([...Array.from(checkArr)])).subscribe();
							})
						)
						.subscribe(_ => {
							this.checkArr$.next(new Set());
						});
				}
			});
	}

	toOrder() {
		combineLatest([this.id$, this.phone$, this.checkArr$])
			.pipe(
				take(1),
				tap(([id, phone, checkArr]) => {
					if (id > 0) {
						if (checkArr.size > 0) {
							if (phone) {
								this.router.navigate(['order/create'], {
									queryParams: {
										order: JSON.stringify([...Array.from(checkArr)]),
									},
								});
							} else {
								this.modal
									.open(PopTips, [
										'依据《网络安全法》，为了保障您的账户安全和正常使用，请完成手机绑定。',
										1,
										2,
										'前往绑定',
									])
									.afterClosed()
									.pipe(take(1))
									.subscribe(sure => {
										if (sure) {
											this.router.navigate(['/passport/bind_phone']);
										}
									});
							}
						}
					} else {
						this.router.navigate(['login'], {
							queryParams: {
								return: 'cart',
							},
						});
					}
				})
			)
			.subscribe();
	}

	deleteOneUnable(id: number) {
		this.store.dispatch(new RemoveFromCart([id]));
	}

	deleteUnable(list: Array<any>) {
		// console.log(list.map(s => s.id))
		const a = '确定要清空失效商品吗？';
		this.modal
			.open(PopTips, [a, true])
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.store.dispatch(new RemoveFromCart(list.map(s => s.goodid)));
				}
			});
	}

	toWork(id: number) {
		this.router.navigate(['live2d', id]);
	}
}
