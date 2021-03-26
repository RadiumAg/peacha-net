import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { MemberApiService } from '../../member-api.service';

@Component({
	selector: 'ivo-record-detail',
	templateUrl: './record-detail.page.html',
	styleUrls: ['./record-detail.page.less'],
})
export class RecordDetailPage {
	constructor(
		private router: Router,
		private memberApi: MemberApiService,
		private route: ActivatedRoute
	) { }

	order$ = this.route.queryParams.pipe(
		switchMap(r => {
			return this.memberApi.getSellOrderDetail(r.id);
		})
	);

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
				this.router.navigate(['/member/record']);
			} else {
				if (window.history.length === 1) {
					this.router.navigate(['/member/record']);
				} else {
					history.go(-1);
				}
			}
		});
	}
}
