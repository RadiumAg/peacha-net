import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { merge, Observable, BehaviorSubject, fromEvent, combineLatest, Subscription } from 'rxjs';
import { map, tap, take, switchMap, filter } from 'rxjs/operators';
import { UserState, Login, IvoryError } from '@peacha-core';
import { Captcha, GeetestClientType, GeeTestService } from '@peacha-net/gee';

@Component({
	selector: 'ivo-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.less'],
})
export class LoginPage implements AfterViewInit, OnDestroy {
	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	password_async_error: any;
	previousUrl$ = new BehaviorSubject<string>('');
	currentUrl$ = new BehaviorSubject<string>('');
	loginForm: FormGroup;

	//极验验证码服务
	captcha: Captcha = null;

	//极验验证码订阅
	geeSubscription: Subscription = null;
	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private cdr: ChangeDetectorRef,
		private store: Store,
		private gt: GeeTestService
	) {
		this.loginForm = this.fb.group({
			account: new FormControl('', [Validators.required]),
			password: new FormControl('', [
				Validators.required,
				Validators.minLength(8),
				Validators.maxLength(16),
				Validators.pattern('^(?=.*[a-zA-Zd])[!-~]{8,16}$'),
			]),
		});
	}

	get account() {
		return this.loginForm.get('account');
	}

	get password() {
		return this.loginForm.get('password');
	}

	changeValue() {
		this.loginForm.valueChanges.pipe(take(1)).subscribe(_ => {
			this.password.setValue('');
		});
	}

	ngAfterViewInit(): void {
		//注册并订阅验证码服务
		this.geeSubscription = this.gt
			.register(GeetestClientType.Web, {
				width: '390px',
			})
			.subscribe({
				next: res => {
					switch (res.state) {
						//验证码初始化成功
						case 'ready': {
							this.captcha = res.captcha;
							break;
						}
						//验证码校验成功
						case 'success': {
							const token = res.token;
							this.login(token);
							break;
						}
						//验证码二次校验失败 非正常状态，不做特殊处理
						case 'fail': {
							console.log(res);
							break;
						}
					}
				},
				error: err => {
					// 极验内部错误 见http://docs.geetest.com/sensebot/apirefer/errorcode/web
					console.log(err);
				},
			});
	}

	ngOnDestroy() {
		//取消订阅 销毁验证码对象
		this.geeSubscription.unsubscribe();
		this.captcha.destroy();
	}

	submit() {
		this.isLogin$
			.pipe(
				take(1),
				filter(isLogin => {
					if (isLogin) {
						alert('已经登录了哦');
					}
					return !isLogin;
				}),
				filter(() => {
					return this.loginForm.valid;
				})
			)
			.subscribe(() => {
				//调起验证码
				this.captcha.verify();
			});
	}

	login(captchaToken: string) {
		this.store
			.dispatch(
				new Login(
					String(this.loginForm.value.account).includes('@')
						? this.loginForm.value.account
						: this.loginForm.value.account + ',86',
					this.loginForm.value.password,
					captchaToken
				)
			)
			.subscribe(
				_s => {
					this.route.queryParams.subscribe(s => {
						if (s.return) {
							this.router.navigateByUrl(s.return);
						} else {
							this.router.navigate(['/']);
						}
					});
				},
				e => {
					if (e instanceof IvoryError) {
						const errors: {
							wrong_password?: boolean;
							user_not_exist?: boolean;
							account_locked?: boolean;
						} = {};
						switch (e.code) {
							case 101:
								errors.user_not_exist = true;
								this.account?.setErrors(errors);
								break;
							case 102:
								errors.wrong_password = true;
								this.password?.setErrors(errors);
								break;
							case 104:
								errors.account_locked = true;
								this.account?.setErrors(errors);
								break;
						}
						this.cdr.markForCheck();

						this.captcha.reset();
					}
				},
				() => {}
			);
	}

	remote_account_errors(cont: AbstractControl) {
		// cold pipe
		return merge(
			cont.valueChanges.pipe(
				map(_s => {
					return {};
				})
			)
		);
	}
	remote_password_errors() {
		return this.password_async_error;
	}
}
