import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SharedService } from '../live-manager/live.service';
import { tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
	selector: 'ivo-illust-manager',
	templateUrl: './illust-manager.page.html',
	styleUrls: ['./illust-manager.page.less'],
})
export class IllustManagerPage {
	key: FormControl = new FormControl('');
	refresh$ = new BehaviorSubject(1);

	constructor(private http: HttpClient, private _sharedService: SharedService, private router: Router) {}

	re$ = this._sharedService.changeEmitted$
		.pipe(
			tap(s => {
				this.refresh$.next(1);
			})
		)
		.subscribe();

	countList$ = this.refresh$.pipe(
		switchMap(s => {
			return this.http.get(`/work/get_create_works_count?c=1`);
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
