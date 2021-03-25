import { AbstractControl,FormGroup,ValidatorFn,FormArray } from '@angular/forms';

/**
 * @description 转换为Blob对象
 * @param dataurl
 *
 */
export function dataURLtoBlob(dataurl: any): Blob {
	const arr = dataurl.split(',');
	const mime = arr[0].match(/:(.*?);/)[1];
	const bstr = atob(arr[1]);

	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr],{ type: mime });
}

/**
 * @description 触发声明
 * @param form 响应式表单
 * @param control 响应式表单中的控件
 */
export function validator(form: FormGroup,control: { [key: string]: AbstractControl }): void {
	// tslint:disable-next-line: forin
	if (form instanceof FormGroup) {
		for (const key in control) {
			form.controls[key].markAsDirty();
			form.controls[key].updateValueAndValidity();
		}
	}
}

/**
 * @description 数组最小长度
 * @param minLength 最小长度
 */
export function ArrayValidator(minLength: number): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		if (control.value.length < minLength) {
			return { array: true };
		}
		return null;
	};
}

/**
 * @description 数组最小长度
 * @param minLength 最小长度
 */
export function emptyStringValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		return control.value.trim().length ? null : { array: true };
	};
}

export function isEmptyInputValue(value): boolean {
	return value == null || value.length === 0;
}

export function getFileType(fileName: string): string {
	return fileName.substring(fileName.lastIndexOf('.') + 1);
}

export function live2dValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		if (!control.value.token) {
			return { ['token']: 'noToken' };
		}
		return null;
	};
}

export function live2dPriceValidator(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		// control.value为null时，controler.value为0
		if (control.value === null) {
			return { nullPrice: 'error' };
		} else if (control.value === 0) {
			return { zeroPrice: 'error' };
		} else if (control.value < 0) {
			return { negativePrice: 'error' };
		} else if (control.value % 1 !== 0) {
			return { floatPrice: 'error' };
		} else {
			return null;
		}
	};
}

export function getEasingSine(value: number): number {
	if (value < 0) {
		return 0;
	} else if (value > 1) {
		return 1;
	}
	return 0.5 - 0.5 * Math.cos(value * Math.PI);
}

export function isDocumentInFullScreenMode(): boolean {
	return document.fullscreenElement !== null;
}
