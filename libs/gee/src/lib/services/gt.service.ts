import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeeInitParams, Captcha, initGeetest, GeeConfig } from '../gt';
import { switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';

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

	public register(dom: HTMLElement | null, client: GeetestClientType, config?: GeeConfig) {
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
							offline: result.success === 1,
							new_captcha: result.new_captcha,
							...config,
							product: 'bind',
						})
					);
				})
			);
	}

	public validate(params: SecondValidateParams) {
		return this.http.post<SecondValidateResult>('/captcha/geetest/validate', params);
	}
}
