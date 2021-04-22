import { Component,forwardRef,ViewChild,ElementRef,Input } from '@angular/core';
import { NG_VALUE_ACCESSOR,ControlValueAccessor } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { HttpClient,HttpEventType } from '@angular/common/http';
import { filter,map,switchMap } from 'rxjs/operators';
import { dataURLtoBlob,ModalService,Process } from '@peacha-core';
import { Cropper,PopTips } from '@peacha-core/components';


@Component({
	selector: 'ivo-thumbnail-upload',
	templateUrl: './thumbnail-upload.component.html',
	styleUrls: ['./thumbnail-upload.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ThumbnailUploadComponent),
			multi: true,
		},
	],
})
export class ThumbnailUploadComponent implements ControlValueAccessor {
	constructor(private modal: ModalService,private http: HttpClient) { }
	Process$: BehaviorSubject<Process> = new BehaviorSubject({
		success: false,
		progress: 0,
	});
	currentImage$ = new BehaviorSubject('');
	progress = false;
	@ViewChild('c',{ read: ElementRef })
	file: ElementRef;
	@Input() maxSize = 3145728;
	@Input() withAndHeightSize = 16384;
	fnOnChange?: (value: any) => void;
	fnOnTouched?: () => void;

	/**
	 *  @description 验证策略对象
	 */
	verify = {
		sizeVerify: (e: InputEvent) => {
			let size = 0;
			for (const key in (e.target as HTMLInputElement).files) {
				if (!isNaN(Number(key))) {
					size += (e.target as HTMLInputElement).files.item(Number(key)).size;
				}
			}

			if (size > this.maxSize) {
				this.modal.open(PopTips,['容量超过限制大小，请重新上传']);
				return false;
			}
			return true;
		},
		withAndHeightSize: (e: File) => {
			const img = new Image();
			img.src = window.URL.createObjectURL(e);
			if (img.width > this.withAndHeightSize || img.height > this.withAndHeightSize) {
				this.modal.open(PopTips,['长宽超过限制']);
				return false;
			}
			return true;
		}
	};

	upload(img: Blob) {
		const form = new FormData();
		form.append('f',img,'cover.png');
		(this.file.nativeElement as HTMLInputElement).value = '';
		return this.http
			.post('/common/upload_file',form,{
				reportProgress: true,
				observe: 'events',
			})
			.pipe(
				filter(s => {
					return s.type === HttpEventType.UploadProgress || s.type === HttpEventType.Response;
				}),
				map(e => {
					if (e.type === HttpEventType.UploadProgress) {
						// return {
						//     success: false,
						//     // tslint:disable-next-line: no-non-null-assertion
						//     progress: e.loaded / e.total!,
						// };
						this.Process$.next({
							success: false,
							// tslint:disable-next-line: no-non-null-assertion
							progress: e.loaded / e.total,
						});
						// tslint:disable-next-line: triple-equals
					} else if (e.type == HttpEventType.Response) {
						if (e.ok) {
							// tslint:disable-next-line: no-non-null-assertion
							const ret = e.body as {
								token: string;
								url: string;
							};
							this.fnOnChange?.(ret);
							this.Process$.next({
								success: true,
								progress: 1,
							});
							this.progress = false;
						}
					} else {
						throw new Error('unexpected event type.');
					}
				})
			);
	}

	writeValue(ret: { token: string; url: string }) {
		// tslint:disable-next-line: no-unused-expression
		ret && this.currentImage$.next(ret.url);
		// tslint:disable-next-line: no-unused-expression
	}
	registerOnChange(fn: any) {
		this.fnOnChange = fn;
	}
	registerOnTouched(fn: any) {
		this.fnOnTouched = fn;
	}

	/**
	 * @description 清空input对象
	 */
	private clearInput(e: HTMLInputElement) {
		e.value = '';
	}

	inputChange(e: InputEvent) {
		const inputTarget = e.target as HTMLInputElement;
		if (!this.verify.sizeVerify(e) || !this.verify.sizeVerify(e)) {
			this.clearInput(inputTarget);
			return;
		}

		this.modal
			.open(Cropper,inputTarget.files?.item(0))
			.afterClosed()
			.pipe(
				switchMap(_ => {
					if (_) {
						this.progress = true;
						this.currentImage$.next(_);
						return this.upload(dataURLtoBlob(_));
					}
				})
			)
			.subscribe();

		this.clearInput(inputTarget);
	}
}
