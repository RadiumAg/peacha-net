# gee

极验验证码服务

# demo

```
import { Component, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Router, ActivatedRoute } from '@angular/router';
import { merge, Observable, BehaviorSubject } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';
import { UserState, Login, IvoryError } from '@peacha-core';
import { GeetestClientType, GeeTestService } from '@peacha-net/gee';

@Component({
	selector: 'ivo-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.less'],
	//每个组件唯一实例
	providers: [GeeTestService],
})
export class LoginPage implements AfterViewInit, OnDestroy {
	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	password_async_error: any;
	previousUrl$ = new BehaviorSubject<string>('');
	currentUrl$ = new BehaviorSubject<string>('');
	loginForm: FormGroup;

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
		const { ready$, success$, fail$ } = this.gt.register(GeetestClientType.Web, {
			width: '390px',
		});
		//验证码初始化成功 只在这里订阅错误处理
		ready$.subscribe({
			next: () => {
				console.log('ready');
			},
			error: err => {
				console.log(err);
			},
		});
		//验证码验证成功 做后续的表单提交处理
		success$.subscribe(res => {
			//token 添加到接口调用
			this.login(res.token);
		});
		//验证失败，非正常情况，可不处理
		fail$.subscribe(res => {
			console.log(res);
		});
	}

	ngOnDestroy() {
		//统一销毁
		this.gt.destroy();
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
				this.gt.verify();
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

```
