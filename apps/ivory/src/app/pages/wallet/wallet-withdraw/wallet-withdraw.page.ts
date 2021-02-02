import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, take, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription, combineLatest, empty, interval, EMPTY } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { SubmitSuccess } from './submit-success/submit-success';
import { OnDestroy } from '@angular/core';
import { UserState, IvoryError, Toast, ModalService } from '@peacha-core';
import { Steps } from '@peacha-core/components';


@Component({
	selector: 'ivo-wallet-withdraw',
	templateUrl: './wallet-withdraw.page.html',
	styleUrls: ['./wallet-withdraw.page.less'],
})
export class WalletWithdrawPage implements OnDestroy {
	@ViewChild(Steps) steps: Steps;

	@Select(UserState.email)
	email$: Observable<string>;

	@Select(UserState.phone)
	phone$: Observable<string>;
	verifyCode = new FormControl('');

	code = new FormControl('');
	token: string;
	type: number;

	sp?: Subscription;
	cooldown$ = new BehaviorSubject<number>(0);
	requesting$ = new BehaviorSubject<boolean>(false);
	constructor(private http: HttpClient, private toast: Toast, private modal: ModalService) { }
	maxMoney$ = new BehaviorSubject(0);

	/**
	 * 获取钱包信息
	 */
	wallet$ = this.http.get<{ status: number; balance: number; cashout: number }>(`/trade/wallet/info/`).pipe(
		tap(s => {
			this.maxMoney$.next(s.balance);
		})
	);

	flag$ = new BehaviorSubject(true);
	money: FormControl = new FormControl('', Validators.required);
	account: FormControl = new FormControl('', Validators.required);
	name: FormControl = new FormControl('', Validators.required);

	/**
	 * 提现方式
	 */
	choice$ = new BehaviorSubject(0);

	space$ = new BehaviorSubject<number>(0);

	outMoney$ = new BehaviorSubject(0);

	errorMsg: string;

	// pay$ = this.http
	//     .get<any>(`/wallet/cashout/payee`)
	//     .pipe(
	//         tap((s) => {
	//             this.account.setValue(s.account);
	//             this.name.setValue(s.name);
	//         })
	//     );
	palcehold(data: number) {
		this.money.setValue(data);
	}

	sure(input: HTMLInputElement) {
		const a = input.getBoundingClientRect();
		this.flag$
			.pipe(
				take(1),
				tap(s => {
					if (s) {
						this.flag$.next(false);
						this.http
							.post('/trade/wallet/cashout/launch', {
								amount: this.money.value,
								channelId: 2,
								token: this.token,
								payeeJsonParams: JSON.stringify({
									payeeName: this.name.value,
									payeeAccount: this.account.value,
								}),
							})
							.subscribe(
								_s => {
									this.modal.open(SubmitSuccess);
								},
								(e: IvoryError) => {
									if (e.code == 109) {
										this.toast.show('验证码失效，请重新发起提现', {
											type: 'error',
											origin: {
												clientX: a.left,
												clientY: a.bottom,
											},
											timeout: 1000,
										});
									}
								}
							);
					}
				})
			)
			.subscribe();
		// this.flag$.subscribe(s => {
		//   console.log(s)
		//   if (s) {
		//     this.flag$.next(false)

		//     // this.http.post('/wallet/cashout/launch', {
		//     //   amount: this.money.value,
		//     //   token: this.token,
		//     //   payee_account: this.account.value,
		//     //   payee_name: this.name.value
		//     // }).subscribe(s => {
		//     //   this.modal.open(SubmitSuccess);
		//     //   this.flag$.next(false)
		//     // })
		//   }
		// })
	}

	out() {
		this.outMoney$.next(this.money.value * 0.98);
	}

	allMoney(count: number) {
		this.money.setValue(count);
		this.outMoney$.next(this.money.value * 0.98);
	}

	next(m: number) {
		if (this.money.valid) {
			if (this.money.value <= m) {
				this.http.get(`/trade/wallet/cashout/check?amount=${this.money.value}`).subscribe((s: any) => {
					if (s.result) {
						this.steps.goto('four');
					} else {
						this.errorMsg = s.msg;
						this.money.setErrors({
							nocan: true,
						});
					}
				});
			} else {
				this.money.setErrors({
					max: true,
				});
			}
		}
	}

	/**
	 * 请求验证码
	 */
	request(i: number) {
		this.type = i;
		this.sp = combineLatest([this.cooldown$, this.requesting$])
			.pipe(
				take(1),
				switchMap(([cooldown, requesting]) => {
					if (cooldown > 0 || requesting) {
						return EMPTY;
					}
					this.requesting$.next(true);
					return this.http
						.post('/common/request_target_verify_code', {
							t: i,
							p: 6,
						})
						.pipe(
							tap(
								_s => {
									this.steps.goto('two');
									this.requesting$.next(false);
								},
								_e => {
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
							}),
							catchError((s: IvoryError) => {
								if (s.code == 101) {
									alert('用户不存在');
								}
								return EMPTY;
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
				() => {
					// 销毁时回收...
				}
			);
	}

	/**
	 * 再次请求验证码
	 */
	requestAgain() {
		this.sp = combineLatest([this.cooldown$, this.requesting$])
			.pipe(
				take(1),
				switchMap(([cooldown, requesting]) => {
					if (cooldown > 0 || requesting) {
						return EMPTY;
					}
					this.requesting$.next(true);
					return this.http
						.post('/common/request_target_verify_code', {
							t: this.type,
							p: 6,
						})
						.pipe(
							tap(
								_s => {
									this.requesting$.next(false);
								},
								_e => {
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
				() => {
					// 销毁时回收...
				}
			);
	}

	/**
	 * 验证验证码
	 */
	confirmVerify(el: HTMLInputElement) {
		const a = el.getBoundingClientRect();
		if (this.verifyCode.valid) {
			this.http
				.post<{
					token: string;
				}>('/common/get_target_verify_token', {
					t: this.type,
					p: 6,
					v: this.verifyCode.value,
				})
				.subscribe(
					s => {
						this.token = s.token;
						this.steps.goto('three');
					},
					_e => {
						// this.verifyCode.setErrors({
						//     wrong_code: true
						// });
						this.toast.show('验证码错误', {
							type: 'error',
							origin: {
								clientX: a.left,
								clientY: a.bottom,
							},
							timeout: 1000,
						});
					}
				);
		} else if (!this.verifyCode.hasError('required')) {
			this.toast.show('验证码不能为空', {
				type: 'error',
				origin: {
					clientX: a.left,
					clientY: a.bottom,
				},
				timeout: 1000,
			});
		}
	}

	ngOnDestroy() {
		this.toast.close();
	}
}
