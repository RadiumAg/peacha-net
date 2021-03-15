import { Component, OnInit, Inject } from '@angular/core';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';
import { MemberApiService } from '../../member-api.service';


@Component({
	selector: 'ivo-goods-manager',
	templateUrl: './goods-manager.page.html',
	styleUrls: ['./goods-manager.page.less'],
})
export class GoodsManagerPage implements OnInit {
	update$ = new BehaviorSubject<number>(0);

	good$ = combineLatest([this.update$]).pipe(
		switchMap(_s => {
			return this.memberApi.getGoods(this.id);
		})
	);

	constructor(
		private modalRef: ModalRef<GoodsManagerPage>,
		@Inject(MODAL_DATA_TOKEN) public id: number,
		private memberApi: MemberApiService,
	) { }

	ngOnInit(): void {
		this.update$.next(23);
	}


	up(id: number, ss: number) {
		this.memberApi.updateSellstate(id, ss)
			.subscribe(_s => {
				this.update$.next(2);
			});
	}

	close() {
		this.modalRef.close();
	}
}
