import { AbstractControl, FormGroup } from '@angular/forms';


/**
 * @description 转换为Blob对象
 * @param dataurl
 *
 */
export function dataURLtoBlob(dataurl: any) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * @description 触发声明
 * @param form 响应式表单
 * @param control 响应式表单中的控件
 */
export function validator(
    form: FormGroup,
    control: { [key: string]: AbstractControl }
) {
    // tslint:disable-next-line: forin
    for (const key in control) {
        form.controls[key].markAsDirty();
        form.controls[key].updateValueAndValidity();
    }
}

/**
 * @description 会话缓存
 */
export const sessionCache = {
    get(name: any): string {
        return sessionStorage.getItem(name);
    },
    set(key: string, data: any): void {
        sessionStorage.setItem(key, data);
    },
    clearAll(): void {
        sessionStorage.clear();
    },
};

export function isEmptyInputValue(value: string) {
    return value == null || value.length === 0;
}
