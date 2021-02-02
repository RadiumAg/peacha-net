import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';

@Component({
	selector: 'ivo-goods-manager',
	templateUrl: './goods-manager.page.html',
	styleUrls: ['./goods-manager.page.less'],
})
export class GoodsManagerPage implements OnInit {
	update$ = new BehaviorSubject<number>(0);

	good$ = combineLatest([this.update$]).pipe(
		switchMap(_s => {
			return this.http.get<any>(`/work/get_goods?w=${this.id}`);
		})
	);

	constructor(private modalRef: ModalRef<GoodsManagerPage>, @Inject(MODAL_DATA_TOKEN) public id: number, private http: HttpClient) { }

	ngOnInit(): void {
		this.update$.next(23);
	}


	up(id: number, ss: number) {
		this.http
			.post('/work/update_sellstate', {
				g: id,
				ss: ss,
			})
			.subscribe(_s => {
				this.update$.next(2);
			});
	}

	close() {
		this.modalRef.close();
	}
}
