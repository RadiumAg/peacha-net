import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable, BehaviorSubject, Subscription, combineLatest, empty, interval, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { take, switchMap, tap, takeUntil } from 'rxjs/operators';
import { Steps } from '@peacha-core/components';
import { FetchMe } from '@peacha-core/state';


@Component({
	selector: 'ivo-bind-mail',
	templateUrl: './bind-mail.page.html',
	styleUrls: ['./bind-mail.page.less'],
})
export class BindMailPage {
	constructor(private http: HttpClient, private store: Store, private fb: FormBuilder, private router: Router) {
		this.verifyCode = this.fb.control('', [Validators.required]);
		this.verifyCode2 = this.fb.control('', [Validators.required]);
		this.emailText = this.fb.control('', [Validators.required, Validators.email]);
		this.phone$ = this.store.select(s => s.user.phone);
	}
	@ViewChild(Steps) steps: Steps;
	phone$: Observable<string>;
	emailText: FormControl;
	verifyCode: FormControl;
	verifyCode2: FormControl;

	cooldown$ = new BehaviorSubject<number>(0);
	requesting$ = new BehaviorSubject<boolean>(false);
	sp?: Subscription;

	cooldown2$ = new BehaviorSubject<number>(0);
	requesting2$ = new BehaviorSubject<boolean>(false);
	sp2?: Subscription;

	token: any;
	wrong_code: any;
	c$ = new Subject();

	s$ = new BehaviorSubject<string>('');

	sendVerifyToPhone() {
		this.sp = combineLatest([this.cooldown$, this.requesting$])
			.pipe(
				take(1),
				switchMap(([cooldown, requesting]) => {
					if (cooldown > 0 || requesting) {
						return empty();
					}
					this.requesting$.next(true);
					return this.http
						.post('/common/request_target_verify_code', {
							t: 0,
							p: 3,
						})
						.pipe(
							tap(
								() => {
									this.requesting$.next(false);
									this.steps.next();
								},
								() => {
									this.requesting$.next(false);
								},
								() => { }
							),
							switchMap(_ => {
								this.cooldown$.next(60);
								return interval(1000).pipe(
									takeUntil(this.c$),
									take(60),
									tap(
										v => {
											this.cooldown$.next(59 - v);
										},
										_e => { },
										() => { }
									)
								);
							})
						);
				}),
				tap(
					_f => { },
					null,
					() => { }
				)
			)
			.subscribe(
				_b => { },
				null,
				() => { }
			);
	}

	sendVerifyToPhoneAgain() {
		this.sp = combineLatest([this.cooldown$, this.requesting$])
			.pipe(
				take(1),
				switchMap(([cooldown, requesting]) => {
					if (cooldown > 0 || requesting) {
						return empty();
					}
					this.requesting$.next(true);
					return this.http
						.post('/common/request_target_verify_code', {
							t: 0,
							p: 3,
						})
						.pipe(
							tap(
								() => {
									this.requesting$.next(false);
								},
								() => {
									this.requesting$.next(false);
								},
								() => { }
							),
							switchMap(_ => {
								this.cooldown$.next(60);
								return interval(1000).pipe(
									take(60),
									tap(
										v => {
											this.cooldown$.next(59 - v);
										},
										_e => { },
										() => { }
									)
								);
							})
						);
				}),
				tap(
					_f => { },
					null,
					() => { }
				)
			)
			.subscribe(
				_b => { },
				null,
				() => { }
			);
	}

	sendVerifyToEmail() {
		this.c$.next();
		this.c$.complete();
		this.sp2 = combineLatest(this.cooldown2$, this.requesting2$)
			.pipe(
				take(1),
				switchMap(([cooldown, requesting]) => {
					if (cooldown > 0 || requesting) {
						return empty();
					}
					this.requesting$.next(true);
					return this.http
						.post('/common/request_reset_verify_code', {
							a: this.emailText.value,
							t: this.token,
						})
						.pipe(
							tap(
								() => {
									this.steps.next();
									this.requesting$.next(false);
								},
								e => {
									this.requesting$.next(false);
									if (e.code == 109) {
										this.emailText.setErrors({
											time: true,
										});
									} else if (e.code == 107) {
										this.emailText.setErrors({
											register: true,
										});
									}
									this.s$.next(' ');
								}
							),
							switchMap(_ => {
								this.cooldown$.next(60);
								return interval(1000).pipe(
									take(60),
									tap(
										v => {
											this.cooldown$.next(59 - v);
										},
										_e => { }
									)
								);
							})
						);
				}),
				tap(_f => { })
			)
			.subscribe(_b => { });
	}
	sendVerifyToEmailAgain() {
		this.sp2 = combineLatest(this.cooldown2$, this.requesting2$)
			.pipe(
				take(1),
				switchMap(([cooldown, requesting]) => {
					if (cooldown > 0 || requesting) {
						return empty();
					}
					this.requesting$.next(true);
					return this.http
						.post('/common/request_reset_verify_code', {
							a: this.emailText.value,
							t: this.token,
						})
						.pipe(
							tap(
								() => {
									this.requesting$.next(false);
								},
								() => {
									this.requesting$.next(false);
								}
							),
							switchMap(_ => {
								this.cooldown$.next(60);
								return interval(1000).pipe(
									take(60),
									tap(
										v => {
											this.cooldown$.next(59 - v);
										},
										_e => { },
										() => { }
									)
								);
							})
						);
				}),
				tap(
					_f => { },
					null,
					() => { }
				)
			)
			.subscribe(
				_b => { },
				null,
				() => { }
			);
	}

	mobileVertify() {
		this.http
			.post<{
				token: string;
			}>('/common/get_target_verify_token', {
				t: 0,
				p: 3,
				v: this.verifyCode.value,
			})
			.subscribe(
				s => {
					this.steps.next();
					this.token = s.token;
				},
				_e => {
					this.verifyCode.setErrors({
						wrong_code: true,
					});
				}
			);
	}

	finishBind() {
		this.http
			.post('/user/reset_email', {
				n: this.emailText.value,
				v: this.verifyCode2.value,
			})
			.subscribe(
				_s => {
					this.store.dispatch(new FetchMe()).subscribe();
					this.steps.next();
				},
				_e => {
					this.verifyCode2.setErrors({
						wrong_code: true,
					});
				}
			);
	}
	skip() {
		this.router.navigate(['setting']);

		// location.replace("./")
		this.store.dispatch(new FetchMe()).subscribe();
	}
}
