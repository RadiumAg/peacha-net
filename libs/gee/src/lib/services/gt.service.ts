import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeeInitParams, Captcha, initGeetest, GeeConfig } from '../gt';
import { map, switchMap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';

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

@Injectable({
	providedIn: 'root',
})
export class GeeTestService {
	constructor(private http: HttpClient) {}

	public register(client: GeetestClientType, config?: GeeConfig) {
		return this.http
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
					return new Observable<
						| {
								state: 'ready';
								captcha: Captcha;
						  }
						| {
								state: 'success';
								msg: string;
								token: string;
						  }
						| {
								state: 'fail';
								msg: string;
								token: string;
						  }
					>(observer => {
						captcha.onReady(() => {
							observer.next({
								state: 'ready',
								captcha,
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
				})
			);
	}

	private validate(params: SecondValidateParams) {
		return this.http.post<SecondValidateResult>('/captcha/geetest/validate', params);
	}
}
