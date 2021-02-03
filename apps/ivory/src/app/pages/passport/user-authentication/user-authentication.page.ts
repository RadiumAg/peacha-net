import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Subscription, interval, Observable, EMPTY } from 'rxjs';
import { take, switchMap, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { UserState, ModalService, Toast, IvoryError } from '@peacha-core';
import { PopTips, Steps } from '@peacha-core/components';
import { SubmitCardImage, SubmitInformation } from '@peacha-core/state';

@Component({
	selector: 'ivo-user-authentication',
	templateUrl: './user-authentication.page.html',
	styleUrls: ['./user-authentication.page.less'],
})
export class UserAuthenticationPage implements OnDestroy {
	@ViewChild(Steps) steps: Steps;
	@ViewChild('inputOne') inputOne: ElementRef;
	@ViewChild('inputTwo') inputTwo: ElementRef;
	@ViewChild('inputThree') inputThree: ElementRef;

	@Select(UserState.email)
	email$: Observable<string>;

	@Select(UserState.phone)
	phone$: Observable<string>;

	onePic$ = new BehaviorSubject('/assets/image/i-real-one.png');
	twoPic$ = new BehaviorSubject('/assets/image/i-real-two.png');
	threePic$ = new BehaviorSubject('/assets/image/i-real-three.png');
	oneToken: string;
	twoToken: string;
	threeToken: string;

	constructor(private http: HttpClient, private modal: ModalService, private toast: Toast, private router: Router, private store: Store) {
		this.verifyCode = new FormControl('', [Validators.required]);
		this.name = new FormControl('', [
			Validators.required,
			Validators.pattern('^[\u4e00-\u9fa5]+$'),
			Validators.maxLength(15),
			Validators.minLength(2),
		]);
		this.code = new FormControl('', [
			Validators.required,
			Validators.maxLength(18),
			Validators.pattern('^(([0-9]{18})|([0-9]{17}X))$'),
		]);
	}

	verifyCode = new FormControl('');
	name = new FormControl('');
	code = new FormControl('');
	token: string;
	type: number;

	sp?: Subscription;
	cooldown$ = new BehaviorSubject<number>(0);
	requesting$ = new BehaviorSubject<boolean>(false);

	/**请求验证码 */
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
							p: 7,
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

	/**再次请求验证码 */
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
							p: 7,
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

	/**验证验证码 */
	confirmVerify(el: HTMLInputElement) {
		const a = el.getBoundingClientRect();
		if (this.verifyCode.valid) {
			this.http
				.post<{
					token: string;
				}>('/common/get_target_verify_token', {
					t: this.type,
					p: 7,
					v: this.verifyCode.value,
				})
				.subscribe(
					s => {
						this.token = s.token;
						this.steps.goto('fill');
					},
					_e => {
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

	goUpdate(input: HTMLInputElement) {
		const a = input.getBoundingClientRect();
		let text: string;
		if (this.name.valid && this.code.valid) {
			this.store.dispatch(new SubmitInformation(this.token, this.name.value, this.code.value)).subscribe(
				_s => {
					this.steps.goto('update');
				},
				e => {
					switch (e.code) {
						case 305:
							text = '身份证号有误';
							break;
						case 109:
							text = '验证已超时';
							break;
						case 301:
							text = '实名认证已在审核中，请勿重复提交';
							break;
						case 300:
							text = '实名认证已通过，请勿重复提交';
							break;
					}
					this.toast.show(text, {
						type: 'error',
						origin: {
							clientX: a.left,
							clientY: a.bottom,
						},
						timeout: 1000,
					});
				}
			);
		} else {
			// this.toast.show("请填写好姓名和身份证号后再提交", {
			//     type: 'error',
			//     origin: {
			//         clientX: a.left,
			//         clientY: a.bottom
			//     },
			//     timeout: 5000
			// });
		}
		// this.steps.goto('update')
	}


	upPicOne(event: any) {
		const url = event.target.files[0];
		const imgtype = url.name.toLowerCase().split('.');
		const a = imgtype.findIndex((l: string) => l == 'png');
		const b = imgtype.findIndex((l: string) => l == 'jpg');
		const c = imgtype.findIndex((l: string) => l == 'jpeg');
		if (a > 0 || b > 0 || c > 0) {
			if (url.size / 1024 / 1024 <= 2) {
				const form = new FormData();
				form.append('f', url);
				this.http.post<{ token: string; url: string }>('/common/upload_file', form).subscribe(s => {
					this.onePic$.next(s.url);
					this.oneToken = s.token;
					this.inputOne.nativeElement.value = null;
				});
			} else {
				this.modal.open(PopTips, ['你上传的图片尺寸过大！最大为2M', false]);
			}
		} else {
			this.modal.open(PopTips, ['图片格式不正确，背景图仅支持.png,.jpg,.jpeg', false]);
		}
	}

	upPicTwo(event: any) {
		const url = event.target.files[0];
		const imgtype = url.name.toLowerCase().split('.');
		const a = imgtype.findIndex((l: string) => l == 'png');
		const b = imgtype.findIndex((l: string) => l == 'jpg');
		const c = imgtype.findIndex((l: string) => l == 'jpeg');
		if (a > 0 || b > 0 || c > 0) {
			if (url.size / 1024 / 1024 <= 2) {
				const form = new FormData();
				form.append('f', url);
				this.http.post<{ token: string; url: string }>('/common/upload_file', form).subscribe(s => {
					this.twoPic$.next(s.url);
					this.twoToken = s.token;
					this.inputTwo.nativeElement.value = null;
				});
			} else {
				this.modal.open(PopTips, ['你上传的图片尺寸过大！最大为2M', false]);
			}
		} else {
			this.modal.open(PopTips, ['图片格式不正确，背景图仅支持.png,.jpg,.jpeg', false]);
		}
	}

	upPicThree(event: any) {
		const url = event.target.files[0];
		const imgtype = url.name.toLowerCase().split('.');
		const a = imgtype.findIndex((l: string) => l == 'png');
		const b = imgtype.findIndex((l: string) => l == 'jpg');
		const c = imgtype.findIndex((l: string) => l == 'jpeg');
		if (a > 0 || b > 0 || c > 0) {
			if (url.size / 1024 / 1024 <= 2) {
				const form = new FormData();
				form.append('f', url);
				this.http.post<{ token: string; url: string }>('/common/upload_file', form).subscribe(s => {
					this.threePic$.next(s.url);
					this.threeToken = s.token;
					this.inputThree.nativeElement.value = null;
				});
			} else {
				this.modal.open(PopTips, ['你上传的图片尺寸过大！最大为2M', false]);
			}
		} else {
			this.modal.open(PopTips, ['图片格式不正确，背景图仅支持.png,.jpg,.jpeg', false]);
		}
	}

	next(el: HTMLButtonElement) {
		const a = el.getBoundingClientRect();
		let text: string;
		this.store.dispatch(new SubmitCardImage(this.token, this.oneToken, this.threeToken, this.twoToken)).subscribe(
			_s => {
				this.router.navigate(['passport/authenticate/wait']);
			},
			e => {
				switch (e.code) {
					case 302:
						text = '上传身份证照片失败';
						break;
					case 303:
						text = '身份信息未提交';
						break;
					case 304:
						text = '照片过期';
						break;
					case 305:
						text = '身份证号有误';
						break;
					case 109:
						text = '验证已超时';
						break;
					case 301:
						text = '实名认证已在审核中，请勿重复提交';
						break;
					case 300:
						text = '实名认证已通过，请勿重复提交';
						break;
				}
				this.toast.show(text, {
					type: 'error',
					origin: {
						clientX: a.left,
						clientY: a.bottom,
					},
					timeout: 1000,
				});
			}
		);
		// this.steps.goto('fill');
	}

	ngOnDestroy() {
		this.toast.close();
	}
}
