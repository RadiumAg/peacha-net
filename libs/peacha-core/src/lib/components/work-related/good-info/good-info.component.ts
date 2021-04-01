import { Component, Input } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { PlatformLocation } from '@angular/common';
import { PopTips } from '../../pop-tips/pop-tips';
import { UserState } from '../../../core';
import { ModalService } from '../../../core/service/modals.service';
import { AddToCart } from '../../../core/state/cart.action';
import { CartState } from '../../../core/state/cart.state';

@Component({
	selector: 'ivo-good-info',
	templateUrl: './good-info.component.html',
	styleUrls: ['./good-info.component.less'],
})
export class GoodInfoComponent {
	@Input() authorId: number;
	@Input() name: string;
	@Input() price: number;
	@Input() workId: number;
	@Input() goodId: number;
	@Input() own: boolean;
	@Input() size: number;
	@Input() maxStock: number;
	@Input() saleNumber: number;
	@Input() sellState: number;
	@Input() period: number;
	@Input() category?: number;
	@Input() fileType?: number;

	@Select(UserState.id)
	id$: Observable<number>;

	@Select(CartState.list)
	list$: Observable<number[]>;

	@Select(UserState.phone)
	phone$: Observable<string>;

	fileList$ = new BehaviorSubject({});
	fileListShow = false;

	showWorkDetail = [];
	showGoodDetail = [];

	constructor(
		private store: Store,
		private router: Router,
		private platform: PlatformLocation,
		private http: HttpClient,
		private modal: ModalService
	) { }


	isInCart(goodId: number) {
		return this.list$.pipe(
			map(list => {
				return list.indexOf(goodId) !== -1;
			})
		);
	}

	addToCart() {
		this.store.dispatch(new AddToCart(this.goodId));
	}

	goToCart() {
		this.router.navigateByUrl('/cart');
	}

	addToWarehouse() {
		this.id$
			.pipe(
				take(1),
				map(id => {
					if (id > 0) {
						this.http
							.post(`/work/add_own`, {
								w: this.goodId,
							})
							.pipe(take(1))
							.subscribe({
								next: () => {
									this.own = true;
								},
								error: () => {
									//console.log(e)
								},
							});
					} else {
						this.router.navigate(['/passport/login'], {
							queryParams: {
								return: this.platform.pathname,
							},
						});
					}
				})
			)
			.subscribe();
	}

	goToWarehouse() {
		this.router.navigateByUrl('/store?id=' + this.workId);
	}



	showFileList() {
		this.showWorkDetail = [];
		this.showGoodDetail = [];
		this.http
			.get<{ goodsFilesList: string[]; workFilesList: string[]; size: number }>(`/work/get_goods_detail?g=${this.goodId}`)
			.pipe(
				take(1),
				tap(x => {
					x.workFilesList?.forEach(l => {
						const a: { font: string; type: number } = { font: '', type: -1 };
						a.font = l;
						if (l.split('.png').length > 1 || l.split('.jpg').length > 1 || l.split('.psd').length > 1) {
							a.type = 0;
						} else if (l.split('.zip').length > 1 || l.split('.rar').length > 1) {
							a.type = 1;
						} else if (l.split('.moc3').length > 1 || l.split('.cmo3').length > 1) {
							a.type = 2;
						} else {
							a.type = 3;
						}
						this.showWorkDetail.push(a);
					});

					x.goodsFilesList?.forEach(l => {
						const a: { font: string; type: number } = { font: '', type: -1 };
						a.font = l;
						if (l.split('.png').length > 1 || l.split('.jpg').length > 1 || l.split('.psd').length > 1) {
							a.type = 0;
						} else if (l.split('.zip').length > 1 || l.split('.rar').length > 1) {
							a.type = 1;
						} else if (l.split('.moc3').length > 1 || l.split('.cmo3').length > 1) {
							a.type = 2;
						} else {
							a.type = 3;
						}
						this.showGoodDetail.push(a);
					});
				})
			)
			.subscribe({
				next: fileList => {
					this.fileList$.next(fileList);
				},
			});
		this.fileListShow = true;
	}

	closeFileList() {
		this.fileListShow = false;
	}

	toBuy() {
		combineLatest([this.id$, this.phone$])
			.pipe(
				take(1),
				tap(([id, phone]) => {
					if (id > 0) {
						if (phone) {
							this.router.navigate(['order/create'], {
								queryParams: {
									order: JSON.stringify([this.goodId]),
								},
							});
						} else {
							this.modal
								.open(PopTips, ['依据《网络安全法》，为了保障您的账户安全和正常使用，请完成手机绑定。', 1, 2, '前往绑定'])
								.afterClosed()
								.pipe(take(1))
								.subscribe(sure => {
									if (sure) {
										this.router.navigate(['/passport/bind_phone']);
									}
								});
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
}
