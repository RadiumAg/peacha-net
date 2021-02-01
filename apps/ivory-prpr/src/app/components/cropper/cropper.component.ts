import { Component, ChangeDetectorRef, ViewChild, Input, ElementRef } from '@angular/core';
import { Cropper } from './cropper';
import { ModalService } from 'src/app/core/service/modals.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { dataURLtoBlob } from 'src/app/core/commom/common';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'crop-image',
  template: `
      <img [attr.src]="imgUrl"  (click)="inputAvatar.click()" >
      <input
        type="file"
        (change)="upAvatar($event)"
        #inputAvatar
        hidden
      >
    `,
  styles: ['img{width:100%;height:100%;border-radius:50%}'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CropImage,
      multi: true
    }
  ]
})

export class CropImage implements ControlValueAccessor {


  constructor(private modal: ModalService, private changeDetectorRef: ChangeDetectorRef) { }

  @ViewChild('inputAvatar') inputAvatar: ElementRef;

  @Input()
  imgUrl?: string;
  cropImage?: Blob;


  updata: (v: Blob) => void;

  upAvatar(event: InputEvent & any) {

    if (event.target.files[0]) {
      this.modal.open<Cropper, string | undefined>(Cropper, event.target.files[0]).afterClosed().subscribe(img => {
        if (img) {
          this.imgUrl = img;
          this.changeDetectorRef.markForCheck();
          // tslint:disable-next-line: no-non-null-assertion
          this.cropImage = dataURLtoBlob(this.imgUrl!);
          this.updata(this.cropImage);
        } else {
          // alert("没有img")
        }


      });

      this.inputAvatar.nativeElement.value = null;
    } else {
      // alert("没有event")
    }

  }

  writeValue(val: Blob) {
    this.cropImage = val;
  }

  registerOnChange(fn: any) {
    this.updata = fn;
  }

  registerOnTouched(fn: any) {

  }

}
