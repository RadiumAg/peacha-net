export interface GeeInitParams {
	gt: string;
	challenge: string;
	offline: boolean;
	new_captcha: boolean;
}

export interface GeeConfig {
	product?: 'float' | 'popup' | 'custom' | 'bind';
	width?: string;
	lang?: 'zh-cn' | 'zh-hk' | 'zh-tw' | 'en' | 'ja';
	https?: boolean;
	timeout?: number;
	remUnit?: number;
	zoomEle?: string | null;
	hideSuccess?: boolean;
	hideClose?: boolean;
	hideRefresh?: boolean;
}

export type ValidateResult =
	| {
			geetest_challenge: string;
			geetest_validate: string;
			geetest_seccode: string;
	  }
	| false;

export interface Captcha {
	appendTo(dom: string | HTMLElement): void;
	bindForm(dom: string | HTMLElement): void;
	getValidate(): ValidateResult;
	reset(): void;
	verify(): void;
	onReady(callback: () => void): void;
	onSuccess(callback: () => void): void;
	onError(callback: (error: Error) => void): void;
	onClose(callback: () => void): void;
	destroy(): void;
}

export type GeeInitCallback = (captcha: Captcha) => void;

export function initGeetest(params: GeeTest.GeeInitParams & GeeTest.GeeConfig, callback: GeeTest.GeeInitCallback);
