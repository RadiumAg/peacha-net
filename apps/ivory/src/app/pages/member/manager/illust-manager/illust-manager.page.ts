import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SharedService } from '../live-manager/live.service';
import { tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MemberApiService } from '../../member-api.service';


@Component({
	selector: 'ivo-illust-manager',
	templateUrl: './illust-manager.page.html',
	styleUrls: ['./illust-manager.page.less'],
})
export class IllustManagerPage {
	key: FormControl = new FormControl('');
	refresh$ = new BehaviorSubject(1);

	constructor(
		private memberApi: MemberApiService,
		private _sharedService: SharedService,
		private router: Router
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
			return this.memberApi.getCreateWorksCount(1);
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
