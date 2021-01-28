import { Component, Inject } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ModalRef } from '../../core/service/modals.service';
import { MODAL_DATA_TOKEN } from '../../core/tokens';
@Component({
  selector: 'ivo-crop-banner',
  templateUrl: './crop-banner.html',
  styleUrls: ['./crop-banner.less'],
})
export class CropBanner {
  constructor(
    private modalRef: ModalRef<CropBanner>,
    @Inject(MODAL_DATA_TOKEN) public data: Blob
  ) {}

  cropBanner = '';

  // 图片裁剪
  imageCropped(event: ImageCroppedEvent) {
    this.cropBanner = event.base64!;
  }

  checkAvatar() {
    this.modalRef.close(this.cropBanner);
  }

  cancel() {
    this.modalRef.close(undefined);
  }
}
