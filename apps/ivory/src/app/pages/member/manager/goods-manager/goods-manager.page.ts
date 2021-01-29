import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';

@Component({
	selector: 'ivo-goods-manager',
	templateUrl: './goods-manager.page.html',
	styleUrls: ['./goods-manager.page.less'],
})
export class GoodsManagerPage implements OnInit {
	constructor(private modalRef: ModalRef<GoodsManagerPage>, @Inject(MODAL_DATA_TOKEN) public id: number, private http: HttpClient) {}

	ngOnInit(): void {
		this.update$.next(23);
	}
	update$ = new BehaviorSubject<number>(0);

	good$ = combineLatest(this.update$).pipe(
		switchMap(s => {
			return this.http.get<any>(`/work/get_goods?w=${this.id}`);
		})
	);

	up(id: number, ss: number) {
		this.http
			.post('/work/update_sellstate', {
				g: id,
				ss: ss,
			})
			.subscribe(s => {
				this.update$.next(2);
			});
	}

	close() {
		this.modalRef.close();
	}
}
