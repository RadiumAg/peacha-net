import { Component, forwardRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { HttpEventType, HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { PopTips } from '../../pop-tips/pop-tips';
import { ModalService } from '../../../core/service/modals.service';

@Component({
	selector: 'ivo-report-upload',
	templateUrl: './report-upload.component.html',
	styleUrls: ['./report-upload.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ReportUploadComponent),
			multi: true,
		},
	],
})
export class ReportUploadComponent implements ControlValueAccessor {
	constructor(private http: HttpClient, private sanitizer: DomSanitizer, private modal: ModalService) {}
	private images$ = new BehaviorSubject<UploadImage[]>([]);
	imageShow$ = this.images$.pipe(
		tap(_ => {
			for (let i of _) {
				if (!i.remote_token) {
					return;
				}
			}
			this.fnChange(_);
		})
	);

	startUploadImage(img: File) {
		const form = new FormData();
		form.append('f', img, img.name);
		const symbol = Symbol();
		const upload: UploadImage = {
			symbol,
			process$: this.http
				.post('/common/upload_file', form, {
					reportProgress: true,
					observe: 'events',
				})
				.pipe(
					filter(s => {
						return s.type == HttpEventType.UploadProgress || s.type == HttpEventType.Response;
					}),
					map(e => {
						if (e.type == HttpEventType.UploadProgress) {
							return {
								success: false,
								progress: e.loaded / e.total!,
							};
						} else if (e.type == HttpEventType.Response) {
							if (e.ok) {
								const ret = e.body! as {
									token: string;
									url: string;
								};
								this.uploadSuccess(symbol, ret.token, ret.url);
								return {
									success: true,
									progress: 1,
								};
							}
							return {
								success: false,
								progress: 0,
							};
						} else {
							throw new Error('unexpected event type.');
						}
					})
				),
			url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(img)) as string,
		};
		this.images$.next([...this.images$.value, upload]);
	}

	uploadSuccess(symbol: Symbol, token: string, url: string) {
		const k = this.images$.value.find(s => s.symbol === symbol)!;
		k.remote_token = token;
		window.URL.revokeObjectURL(k.url!); // no need
		this.images$.next(this.images$.value); // submit
	}

	removeFile(symbol: Symbol) {
		this.images$.next([...this.images$.value.filter(x => x.symbol !== symbol)]);
	}

	onPic(event: InputEvent) {
		if ((event.target as HTMLInputElement).files.length > 0) {
			if ((event.target as HTMLInputElement).files?.item(0)?.size < 2 * 1024 * 1024) {
				this.startUploadImage((event.target as HTMLInputElement).files?.item(0)!);
			} else {
				this.modal.open(PopTips, ['图片尺寸大于2M，请重新上传！', 0, 0]);
			}
		}
	}

	writeValue(v: UploadToken[]) {
		v &&
			this.images$.next(
				v.map(s => {
					return {
						remote_token: s.remote_token,
						url: s.url,
						symbol: Symbol(),
						process$: of({
							success: true,
							progress: 1,
						}),
					};
				})
			);
	}

	private fnChange: any;
	registerOnChange(fn: any) {
		this.fnChange = fn;
	}

	private fnTouch: any;
	registerOnTouched(fn: any) {
		this.fnTouch = fn;
	}

	trackBy(index: number, f: UploadImage) {
		return f.symbol;
	}
}

type UploadImage = {
	symbol: Symbol;
	process$: Observable<UpladoProcess>;
} & UploadToken;

type UploadToken = {
	remote_token?: string;
	url?: string;
};

type UpladoProcess = {
	success: boolean;
	progress: number;
};
