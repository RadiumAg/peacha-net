import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { SharedService } from './live.service';
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { MemberApiService } from '../../member-api.service';


@Component({
	selector: 'ivo-live-manager',
	templateUrl: './live-manager.page.html',
	styleUrls: ['./live-manager.page.less'],
})
export class LiveManagerPage {
	key: FormControl = new FormControl('');
	refresh$ = new BehaviorSubject(1);
	constructor(
		private memberApi: MemberApiService,
		private router: Router,
		private _sharedService: SharedService
	) { }
	re$ = this._sharedService.changeEmitted$
		.pipe(
			tap(_s => {
				this.refresh$.next(1);
			})
		)
		.subscribe();

	countList$ = this.refresh$.pipe(
		switchMap(_s => {
			return this.memberApi.getCreateWorksCount(0);
		})
	);

	keyword() {
		this.router.navigate([], {
			queryParams: {
				k: this.key.value,
				p: 1,
			},
			queryParamsHandling: 'merge',
		});
	}
}
