import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { SharedService } from './live.service';
import { tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'ivo-live-manager',
	templateUrl: './live-manager.page.html',
	styleUrls: ['./live-manager.page.less'],
})
export class LiveManagerPage {
	key: FormControl = new FormControl('');
	refresh$ = new BehaviorSubject(1);
	constructor(private http: HttpClient, private router: Router, private _sharedService: SharedService) {}
	re$ = this._sharedService.changeEmitted$
		.pipe(
			tap(s => {
				this.refresh$.next(1);
			})
		)
		.subscribe();

	countList$ = this.refresh$.pipe(
		switchMap(s => {
			return this.http.get(`/work/get_create_works_count?c=0`);
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
