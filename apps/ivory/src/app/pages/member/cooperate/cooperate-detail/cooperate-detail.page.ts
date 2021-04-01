import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { ModifyScale } from './modify-scale/modify-scale';
import { UserState, ModalService } from '@peacha-core';

type Detail = {
	id: number;
	launch_id: number;
	launch_cover: string;
	launch_name: string;
	launch_publishtime: number;
	launch_category: number;
	launch_username: string;
	participate_workid: number;
	participate_cover: string;
	participate_name: string;
	participate_publishtime: string;
	participate_userid: number;
	participate_username: string;
	participate_category: number;
	participate_share: number;
	state: number;
	time: number;
	list: {
		id: number;
		name: string;
		maxstock: number;
		price: number;
	}[];
};
@Component({
	selector: 'ivo-cooperate-detail',
	templateUrl: './cooperate-detail.page.html',
	styleUrls: ['./cooperate-detail.page.less'],
})
export class CooperateDetailPage {
	@Select(UserState.id)
	id$: Observable<number>;

	refresh$ = new BehaviorSubject(0);
	constructor(private http: HttpClient, private route: ActivatedRoute, private modal: ModalService, private router: Router) { }

	detail$ = combineLatest([this.route.queryParams, this.refresh$]).pipe(
		switchMap(([params, _r]) => {
			return this.http.get<Detail>(`/work/get_cooperate_detail?c=${params.id}`);
		})
	);

	goback() {
		window.history.back();
	}

	change(n: number, i: number) {
		this.modal
			.open(ModifyScale, i)
			.afterClosed()
			.subscribe(s => {
				if (s) {
					this.http
						.post('/work/update_cooperate_share', {
							c: n,
							s: s,
						})
						.subscribe(_ => {
							this.refresh$.next(0);
						});
				}
			});
	}

	audit(i: number, id: number) {
		this.http
			.post('/work/audit_cooperate', {
				c: id,
				a: i,
			})
			.subscribe(_ => {
				this.refresh$.next(0);
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
}
