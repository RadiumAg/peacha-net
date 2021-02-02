import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ModalService } from '@peacha-core';
import { Cropper } from 'libs/peacha-core/src/lib/components/cropper/cropper';

@Component({
	selector: 'ivo-cover-image-upload',
	templateUrl: './cover-image-upload.component.html',
	styleUrls: ['./cover-image-upload.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: CoverImageUploadComponent,
			multi: true,
		},
	],
})
export class CoverImageUploadComponent implements ControlValueAccessor {
	cropImage: Blob;
	isLoading = false;
	constructor(private modal: ModalService, private http: HttpClient) {}

	updata = (b: any) => {};

	@Input('url')
	imgUrl: string;

	@Input('target')
	target: string;

	@ViewChild('file', { read: ElementRef })
	files: ElementRef;

	writeValue(url: string): void {
		if (url) {
			this.imgUrl = url;
		}
	}

	registerOnChange(fn: any): void {
		this.updata = fn;
	}

	async uploadImg(file: Blob) {
		const form = new FormData();
		form.append('f', this.cropImage);
		this.http
			.post<{ reslut: any }>(this.target, form)
			.pipe(
				tap(t => {
					this.updata(t);
				})
			)
			.subscribe({
				error: x => {},
				//console.log(x)
			});
	}

	/**
	 * @description 打开模态框
	 * @param event
	 */
	openCrop(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files![0]) {
			this.modal
				.open<Cropper, string | undefined>(Cropper, input.files![0])
				.afterClosed()
				.subscribe(async img => {
					if (img) {
						this.isLoading = true;
						this.imgUrl = img;
						this.cropImage = this.dataURLtoBlob(this.imgUrl!);
						await this.uploadImg(this.cropImage);
						this.files.nativeElement.value = '';
					} else {
					}
				});

			this.files.nativeElement.value = null;
		} else {
		}
	}

	dataURLtoBlob(dataurl: any) {
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

	registerOnTouched(fn: any): void {}
}
