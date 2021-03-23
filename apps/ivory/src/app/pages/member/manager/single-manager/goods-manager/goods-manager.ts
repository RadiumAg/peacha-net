import { Component, OnInit, Inject } from '@angular/core';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';
import { HttpClient } from '@angular/common/http';


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
					max_stock: number,
					sale_number: number,
					sellstate: boolean
				}[]
			}>(`/work/get_goods?w=${this.id}`);
		})
	);

	constructor(
		private modalRef: ModalRef<GoodsManager>,
		@Inject(MODAL_DATA_TOKEN) public id: number,
		private http: HttpClient
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
}
