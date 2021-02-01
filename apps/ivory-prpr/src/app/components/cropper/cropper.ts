import { Component, Inject } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ModalRef } from 'src/app/core/service/modals.service';
import { MODAL_DATA_TOKEN } from 'src/app/core/tokens';

@Component({
  selector: 'ivo-cropper',
  templateUrl: './cropper.html',
  styleUrls: ['./cropper.less']
})
export class Cropper {

  constructor(private modalRef: ModalRef<Cropper>, @Inject(MODAL_DATA_TOKEN) public data: Blob) {
  }
  cropImage = '';

  // 图片裁剪
  imageCropped(event: ImageCroppedEvent) {
    // tslint:disable-next-line: no-non-null-assertion
    this.cropImage = event.base64!;
  }

  checkAvatar() {
    this.modalRef.close(this.cropImage);
  }

  cancel() {
    this.modalRef.close(undefined);
  }

}

