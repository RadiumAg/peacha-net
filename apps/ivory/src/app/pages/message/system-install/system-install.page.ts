import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { tap, take } from 'rxjs/operators';

@Component({
	selector: 'ivo-system-install',
	templateUrl: './system-install.page.html',
	styleUrls: ['./system-install.page.less'],
})
export class SystemInstallPage {
	one$ = new BehaviorSubject<boolean>(true);
	two$ = new BehaviorSubject<boolean>(true);
	three$ = new BehaviorSubject<boolean>(true);
	four$ = new BehaviorSubject<boolean>(true);
	five$ = new BehaviorSubject<boolean>(true);

	state$ = this.http
		.get<{
			all: boolean;
			im: boolean;
			notice: boolean;
			forum: boolean;
			star: boolean;
		}>(`/news/setting`)
		.pipe(
			tap(s => {
				this.one$.next(s.all);
				this.two$.next(s.im);
				this.three$.next(s.notice);
				this.four$.next(s.forum);
				this.five$.next(s.star);
			})
		);

	a$ = combineLatest([this.one$, this.two$, this.three$, this.four$, this.five$]).pipe(
		take(1),
		tap(([one, two, three, four, five]) => {
			this.http
				.post('/news/setup', {
					all: one,
					im: two,
					notice: three,
					forum: four,
					star: five,
				})
				.subscribe();
		})
	);
	open(i: number): void {
		switch (i) {
			case 1:
				this.one$.next(true);
				break;
			case 2:
				this.one$.next(false);
				break;
			case 3:
				this.two$.next(true);
				break;
			case 4:
				this.two$.next(false);
				break;
			case 5:
				this.three$.next(true);
				break;
			case 6:
				this.three$.next(false);
				break;
			case 7:
				this.four$.next(true);
				break;
			case 8:
				this.four$.next(false);
				break;
			case 9:
				this.five$.next(true);
				break;
			case 10:
				this.five$.next(false);
				break;
		}
		this.a$.subscribe();
	}

	constructor(private http: HttpClient) { }
}
