import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  Input,
  ElementRef,
} from '@angular/core';
import { Cropper } from './cropper';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PopTips } from '../pop-tips/pop-tips';
import { ModalService } from '../../core/service/modals.service';
import { dataURLtoBlob } from '../../core/commom/common';

@Component({
  selector: 'crop-image',
  template: `
    <img [attr.src]="imgUrl" (click)="inputAvatar.click()" />
    <input type="file" (change)="upAvatar($event)" #inputAvatar hidden />
  `,
  styles: ['img{width:100%;height:100%;border-radius:50%}'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CropImage,
      multi: true,
    },
  ],
})
export class CropImage implements ControlValueAccessor {
  constructor(
    private modal: ModalService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  @ViewChild('inputAvatar') inputAvatar: ElementRef;

  @Input()
  imgUrl?: string;
  cropImage?: Blob;

  updata: (v: Blob) => void;

  upAvatar(event: InputEvent & any) {
    const imgtype = event.target.files[0].name.toLowerCase().split('.');
    const a = imgtype.findIndex((l) => l == 'png');
    const b = imgtype.findIndex((l) => l == 'jpg');
    const c = imgtype.findIndex((l) => l == 'jpeg');
    if (a > 0 || b > 0 || c > 0) {
      if (event.target.files[0].size <= 1024 * 1024 * 5) {
        this.modal
          .open<Cropper, string | undefined>(Cropper, event.target.files[0])
          .afterClosed()
          .subscribe((img) => {
            if (img) {
              this.imgUrl = img;
              this.changeDetectorRef.markForCheck();
              this.cropImage = dataURLtoBlob(this.imgUrl!);
              this.updata(this.cropImage);
            } else {
              // alert("没有img")
            }
          });

        this.inputAvatar.nativeElement.value = null;
      } else {
        let a = '你上传的图片尺寸过大！最大为5M';
        this.modal.open(PopTips, [a, false]);
      }
    } else {
      let a = '图片格式不正确，背景图仅支持.png,.jpg,.jpeg';
      this.modal.open(PopTips, [a, false]);
    }
  }

  writeValue(val: Blob) {
    this.cropImage = val;
  }

  registerOnChange(fn: any) {
    this.updata = fn;
  }

  registerOnTouched(fn: any) {}
}
