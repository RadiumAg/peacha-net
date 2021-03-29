import { Component, OnInit, Inject } from '@angular/core';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalRef, ModalService, MODAL_DATA_TOKEN } from '@peacha-core';
import { HttpClient } from '@angular/common/http';
import { ChangePrice } from '../change-price/change-price';


@Component({
	selector: 'ivo-goods-manager',
	templateUrl: './goods-manager.html',
	styleUrls: ['./goods-manager.less'],
})
export class GoodsManager implements OnInit {
	update$ = new BehaviorSubject<number>(0);

	good$ = combineLatest([this.update$]).pipe(
		switchMap(_s => {
			return this.http.get<{
				list: {
					id: number,
					name: string,
					maxStock: number,
					saleNumber: number,
					sellState: boolean
				}[]
			}>(`/work/get_goods?w=${this.id}`);
		})
	);

	constructor(
		private modalRef: ModalRef<GoodsManager>,
		@Inject(MODAL_DATA_TOKEN) public id: number,
		private http: HttpClient,
		private modal: ModalService
	) { }

	ngOnInit(): void {
		this.update$.next(23);
	}


	up(id: number, ss: number) {
		this.http.post('/work/update_sellstate', {
			g: id,
			ss: ss
		}).subscribe(_s => {
			this.update$.next(2);
		});
	}

	close() {
		this.modalRef.close();
	}


	changePrice(price: number, id: number, name: string): void {
		this.modal.open(ChangePrice, { price: price, name: name }).afterClosed().subscribe(s => {
			if (s) {
				this.http.post(`/work/update_price`, {
					g: id,
					p: s
				}).subscribe(_ => {
					this.update$.next(2);
				})
			}
		})
	}
}
