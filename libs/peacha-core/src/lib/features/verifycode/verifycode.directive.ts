import { Directive, Input } from '@angular/core';
import { BehaviorSubject, combineLatest, empty, interval, of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, take, catchError } from 'rxjs/operators';

@Directive({
	selector: '*[ivo-verifycode]',
	exportAs: 'verifycode',
})
export class VerifycodeFetchDirective {
	type$ = new BehaviorSubject<number>(-1);
	@Input('verify-type')
	set type(v: number) {
		this.type$.next(v);
	}

	cooldown$ = new BehaviorSubject<number>(0);
	requesting$ = new BehaviorSubject<boolean>(false);

	constructor(private http: HttpClient) {}

	sp?: Subscription;

	request(target: string) {
		return new Promise((res, rej) => {
			this.sp = combineLatest([this.cooldown$, this.requesting$, this.type$])
				.pipe(
					take(1),
					switchMap(([cooldown, requesting, type]) => {
						if (cooldown > 0 || requesting) {
							return empty();
						}
						this.requesting$.next(true);
						return this.http
							.post('/common/request_verify_code', {
								t: target,
								p: type,
							})
							.pipe(
								tap(
									() => {
										this.requesting$.next(false);
									},
									() => {
										this.requesting$.next(false);
									},
									() => {}
								),
								switchMap(_ => {
									this.cooldown$.next(60);
									return interval(1000).pipe(
										take(60),
										tap(
											v => {
												this.cooldown$.next(59 - v);
											},
											e => {},
											() => {}
										)
									);
								})
							);
					}),
					tap(
						f => {},
						null,
						() => {}
					)
				)
				.subscribe(res, rej, () => {
					// 销毁时回收...
					//console.log('aaaaaa');
				});
		});
	}

	ngOnDestroy() {
		this.sp?.unsubscribe();
	}
}
