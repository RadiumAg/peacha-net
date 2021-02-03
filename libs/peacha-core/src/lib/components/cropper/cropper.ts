import { Component, Inject, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { MODAL_DATA_TOKEN } from '../../core/tokens';
import { ModalRef } from '../../core/service/modals.service';

@Component({
	selector: 'ivo-cropper',
	templateUrl: './cropper.html',
	styleUrls: ['./cropper.less'],
})
export class Cropper implements AfterViewInit, OnDestroy {
	constructor(private modalRef: ModalRef<Cropper, string>, @Inject(MODAL_DATA_TOKEN) public data: Blob) {
		this.isLoadAnimate = true;
	}

	isLoadAnimate = true;
	cropImage = '';
	timer;
	ret = 0;
	@ViewChild(ImageCropperComponent)
	img: ImageCropperComponent;
	request =
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window['mozRequestAnimationFrame'] ||
		// tslint:disable-next-line: only-arrow-functions
		function (callback: (...args: any[]) => void) {
			setTimeout(callback, 1000 / 60);
		};

	// 图片裁剪
	imageCropped(event: ImageCroppedEvent) {
		// tslint:disable-next-line: no-non-null-assertion
		this.cropImage = event.base64;
	}

	checkAvatar() {
		this.modalRef.close(this.cropImage);
	}

	cancel() {
		this.modalRef.close('');
	}

	ngAfterViewInit(): void {
		this.ret = this.request(() => {
			this.img.crop();
			this.ngAfterViewInit();
		});
	}

	ngOnDestroy(): void {
		window.cancelAnimationFrame(this.ret);
	}
}
