import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Router, ActivatedRoute } from '@angular/router';
import { merge, Observable, BehaviorSubject } from 'rxjs';
import { map, tap, take } from 'rxjs/operators';
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

	@ViewChild('captcha')
	captchaElement: ElementRef<HTMLElement>;
	captcha: Captcha = null;
	constructor(
		private fb: FormBuilder,
		private store: Store,
		private router: Router,
		private route: ActivatedRoute,
		private cdr: ChangeDetectorRef,
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
	ngAfterViewInit(): void {
		this.gt
			.register(this.captchaElement.nativeElement, GeetestClientType.Web, {
				width: '390px',
			})
			.pipe(
				tap(captcha => {
					captcha.onReady(() => {
						this.captcha = captcha;
					});
				})
			)
			.subscribe(captcha => {
				captcha.onReady(() => {
					this.captcha = captcha;
				});
				captcha.onSuccess(() => {
					const validate = this.captcha.getValidate();
					console.log(validate);
					if (validate !== false) {
						this.gt
							.validate({
								seccode: validate.geetest_seccode,
								challenge: validate.geetest_challenge,
								validate: validate.geetest_validate,
								client: GeetestClientType.Web,
							})
							.subscribe(res => {
								console.log(res);
								captcha.reset();
							});
					}
				});
				captcha.onClose(() => {});
				captcha.onError(error => {
					console.log(error);
				});
			});
	}

	ngOnDestroy() {
		if (this.captcha) {
			this.captcha.destroy();
		}
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

	async login(_e: MouseEvent) {
		this.store
			.selectOnce<number>(s => s.user.id)
			.pipe(
				tap(s => {
					if (s > 0) {
						alert('已经登录了哦');
					} else {
						if (!this.loginForm.valid) {
							return;
						}

						this.captcha.verify();

						// this.store
						// 	.dispatch(
						// 		new Login(
						// 			String(this.loginForm.value.account).includes('@')
						// 				? this.loginForm.value.account
						// 				: this.loginForm.value.account + ',86',
						// 			this.loginForm.value.password
						// 		)
						// 	)
						// 	.subscribe(
						// 		_s => {
						// 			this.route.queryParams.subscribe(s => {
						// 				if (s.return) {
						// 					this.router.navigateByUrl(s.return);
						// 				} else {
						// 					this.router.navigate(['/']);
						// 				}
						// 			});
						// 		},
						// 		e => {
						// 			if (e instanceof IvoryError) {
						// 				const errors: {
						// 					wrong_password?: boolean;
						// 					user_not_exist?: boolean;
						// 					account_locked?: boolean;
						// 				} = {};
						// 				switch (e.code) {
						// 					case 101:
						// 						errors.user_not_exist = true;
						// 						this.account?.setErrors(errors);
						// 						break;
						// 					case 102:
						// 						errors.wrong_password = true;
						// 						this.password?.setErrors(errors);
						// 						break;
						// 					case 104:
						// 						errors.account_locked = true;
						// 						this.account?.setErrors(errors);
						// 						break;
						// 				}
						// 				this.cdr.markForCheck();
						// 			}
						// 		},
						// 		() => {}
						// 	);
					}
				})
			)
			.subscribe();
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
