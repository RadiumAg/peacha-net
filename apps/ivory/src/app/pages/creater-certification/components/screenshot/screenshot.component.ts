import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, OnInit, forwardRef, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { CommmonApiService, ModalService } from '@peacha-core';
import { filter, map } from 'rxjs/operators';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';

@Component({
	selector: 'ivo-screenshot',
	templateUrl: './screenshot.component.html',
	styleUrls: ['./screenshot.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ScreenshotComponent),
			multi: true,
		},
	],
})
export class ScreenshotComponent implements OnInit, ControlValueAccessor {
	constructor(private apiService: CommmonApiService, private sanitizer: DomSanitizer, private modal: ModalService) {}
	@ViewChild('file')
	fileInput: ElementRef<HTMLInputElement>;
	@Input() multiple = false;
	fnChange: () => void;
	@Output()
	uploadCallback: EventEmitter<UploadImage> = new EventEmitter<UploadImage>();
	@Input() disabled = false;
	private _fileSzie = 10485760; // the default  is 4mb

	/**
	 *  @description 验证策略对象
	 */
	verify = {
		sizeVerify: (e: File) => {
			if (e.size > this._fileSzie) {
				this.modal.open(PopTips, ['仅支持10MB以内截图上传，给它减减肥吧～']);
				return false;
			}
			return true;
		},
	};

	uploadFile(fileList: FileList): void {
		const files = this.setFileListToArray(fileList);
		if (files.length == 0) {
			return;
		}
		for (const file of files) {
			if (!this.verify.sizeVerify(file)) {
				this.fileInput.nativeElement.value = '';
				return;
			}
			const formData = new FormData();
			formData.append('f', file);
			const uploadImg: UploadImage = {
				symbol: Symbol(),
				token: '',
				process$: new BehaviorSubject({ progress: 0, success: false }),
				url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)) as string,
				api: this.apiService,
				reportProcess() {
					this.api
						.uploadFile(formData, {
							reportProgress: true,
							observe: 'events',
						})
						.pipe(
							filter((s: any) => {
								return s.type === HttpEventType.UploadProgress || s.type === HttpEventType.Response;
							}),
							map((e: any) => {
								if (e.type === HttpEventType.UploadProgress) {
									this.process$.next({
										success: false,
										progress: e.loaded / e.total,
									});
								} else if (e.type === HttpEventType.Response) {
									if (e.ok) {
										const ret = e.body as {
											token: string;
											url: string;
										};
										this.url = ret.url;
										this.token = ret.token;
										this.process$.next({
											success: true,
											progress: 1,
										});
									} else {
										this.process$.next({
											success: false,
											progress: 0,
										});
									}
								} else {
									throw new Error('unexpected event type.');
								}
							})
						)
						.subscribe();
				},
			};

			this.uploadCallback.emit(uploadImg);
			this.restartInputValue();
		}
	}

	private restartInputValue() {
		this.fileInput.nativeElement.value = '';
	}

	private setFileListToArray(fileList: FileList) {
		return Array.from(fileList);
	}

	writeValue(obj: any): void {}

	registerOnChange(fn: any): void {
		this.fnChange = fn;
	}
	registerOnTouched(fn: any): void {}

	setDisabledState?(isDisabled: boolean): void {}

	ngOnInit(): void {}
}

export type UploadImage = {
	api: CommmonApiService;
	symbol: symbol;
	process$: BehaviorSubject<Partial<UploadProcess>>;
	reportProcess: () => void;
} & Partial<UploadToken>;

export type UploadProcess = {
	success: boolean;
	progress: number;
};

type UploadToken = {
	token?: string;
	url?: string;
};
