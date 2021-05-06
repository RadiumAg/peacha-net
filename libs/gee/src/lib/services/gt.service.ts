import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeeInitParams, Captcha, initGeetest, GeeConfig } from '../gt';
import { catchError, filter, map, publish, switchMap, takeUntil } from 'rxjs/operators';
import { ConnectableObservable, EMPTY, from, Observable, Subject } from 'rxjs';

export enum GeetestClientType {
	Web,
	H5,
	Native,
	Unknown,
}

interface RegisterResult {
	success: 0 | 1;
	gt: string;
	challenge: string;
	new_captcha: boolean;
}

interface SecondValidateParams {
	seccode: string;
	challenge: string;
	validate: string;
	client: GeetestClientType;
}

interface SecondValidateResult {
	result: 'success' | 'fail';
	version: string;
	msg: string;
	token: string;
}

function initGeetestAsync(params: GeeInitParams & GeeConfig) {
	return new Promise<Captcha>(res => {
		initGeetest(params, res);
	});
}
interface CaptchaReadyEvent {
	state: 'ready';
}

interface CaptchaSuccessEvent {
	state: 'success';
	msg: string;
	token: string;
}

interface CaptchaFailEvent {
	state: 'fail';
	msg: string;
	token: string;
}

@Injectable()
export class GeeTestService {
	private captcha: Captcha | null = null;
	private destroy$ = new Subject<void>();
	constructor(private http: HttpClient) {}

	/**
	 * 注册验证码服务
	 */
	public register(client: GeetestClientType = GeetestClientType.Web, config: GeeConfig = {}) {
		const source = this.http
			.get<RegisterResult>('/captcha/geetest/register', {
				params: {
					client: client.toString(),
				},
			})
			.pipe(
				switchMap(result => {
					return from(
						initGeetestAsync({
							gt: result.gt,
							challenge: result.challenge,
							offline: !result.success,
							new_captcha: result.new_captcha,
							...config,
							product: 'bind',
						})
					);
				}),
				switchMap(captcha => {
					return new Observable<CaptchaReadyEvent | CaptchaSuccessEvent | CaptchaFailEvent>(observer => {
						captcha.onReady(() => {
							this.captcha = captcha;
							observer.next({
								state: 'ready',
							});
						});
						captcha.onSuccess(() => {
							const validate = captcha.getValidate();
							if (validate !== false) {
								this.validate({
									seccode: validate.geetest_seccode,
									challenge: validate.geetest_challenge,
									validate: validate.geetest_validate,
									client: GeetestClientType.Web,
								})
									.pipe(
										map(res => ({
											state: res.result,
											msg: res.msg,
											token: res.token,
										}))
									)
									.subscribe({
										next: res => {
											observer.next(res);
										},
										error: err => {
											observer.error(err);
										},
									});
							}
						});
						captcha.onError(error => {
							observer.error(error);
						});
					});
				}),
				publish()
			) as ConnectableObservable<CaptchaReadyEvent | CaptchaSuccessEvent | CaptchaFailEvent>;
		const ready$ = source.pipe(
			takeUntil(this.destroy$),
			filter(res => res.state === 'ready')
		) as Observable<CaptchaReadyEvent>;
		const success$ = source.pipe(
			takeUntil(this.destroy$),
			catchError(() => {
				return EMPTY;
			}),
			filter(res => res.state === 'success')
		) as Observable<CaptchaSuccessEvent>;
		const fail$ = source.pipe(
			takeUntil(this.destroy$),
			catchError(() => {
				return EMPTY;
			}),
			filter(res => res.state === 'fail')
		) as Observable<CaptchaFailEvent>;
		source.connect();

		return { ready$, success$, fail$ };
	}

	/**
	 * 拉起验证码
	 */
	public verify() {
		this.captcha?.verify();
	}

	/**
	 * 验证码服务销毁
	 */
	public destroy() {
		this.destroy$.next();
		this.destroy$.unsubscribe();
		this.captcha?.destroy();
	}

	private validate(params: SecondValidateParams) {
		return this.http.post<SecondValidateResult>('/captcha/geetest/validate', params);
	}
}
