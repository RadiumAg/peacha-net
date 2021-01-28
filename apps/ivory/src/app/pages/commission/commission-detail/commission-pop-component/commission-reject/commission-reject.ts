import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalRef, ModalService, ZoomService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { UploadImageDirective } from 'libs/peacha-core/src/lib/components/uploadImage/uploadImage.directive';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';
import { IllustZoomModalComponent } from '../../../../work/illust-zoom-modal/illust-zoom-modal.component';

@Component({
  selector: 'ivo-commission-reject',
  templateUrl: './commission-reject.html',
  styleUrls: ['./commission-reject.less'],
})
export class CommissionReject implements OnInit {
  title: string;
  reason = new FormControl('', Validators.required);

  p = '';
  isShowReportProgress = false;

  /**type:3 企划退回 ; type:2 企划驳回 ;type:0 源文件有误*/
  /**c:1 画师 ; c:0 模型师 */
  constructor(
    private modalRef: ModalRef<CommissionReject>,
    @Inject(MODAL_DATA_TOKEN) public text: { type: number; c: number },
    private modal: ModalService,
    private http: HttpClient,
    private zoom: ZoomService
  ) {}

  images: Array<{ token: string; url: string }> = [];
  tokens: Array<string> = [];

  ngOnInit(): void {
    if (this.text.type === 3) {
      this.title = '退回';
    } else if (this.text.type === 2) {
      this.title = '驳回';
    } else if (this.text.type === 0) {
      this.title = '源文件有误';
    }
  }

  upload(event: any, input: HTMLInputElement, u: UploadImageDirective): void {
    if (this.images.length < 4) {
      if (event.type.split('image').length > 1) {
        if (event.size <= 1024 * 1024 * 4) {
          const form = new FormData();
          form.append('f', event);
          // this.http.post<{ token: string, url: string }>('/common/upload_file', form, { reportProgress: true, observe: 'events' }).pipe(
          //   filter((event) => {
          //     switch (event.type) {
          //       case HttpEventType.UploadProgress: {
          //         this.p = ((event.loaded / event.total) * 100).toFixed(0) + '%';
          //         this.isShowReportProgress = true;
          //         console.log(this.p)
          //         break;
          //       };
          //       case HttpEventType.Response: {
          //         return true;
          //       }
          //     }
          //     return false;
          //   }),
          //   map((res: HttpResponse<any>) => res.body)
          // ).subscribe(res => {
          //   if (res) {
          //     this.isShowReportProgress = false;
          //     this.images.push(res);
          //     this.tokens.push(res?.token);
          //     input.value = null;
          //   }

          // })

          u.upload(event);
          input.value = null;
        } else {
          this.modal.open(PopTips, ['图片不能超过4M', false]);
        }
      } else {
        this.modal.open(PopTips, ['请上传图片', false]);
      }
    } else {
      this.modal.open(PopTips, ['最多上传4张图片', false]);
    }
  }

  result(e: any): void {
    console.log(typeof e === 'string');
    if (typeof e === 'string') {
      this.p = e;
      this.isShowReportProgress = true;
    } else {
      this.isShowReportProgress = false;
      this.images.push(e);
      this.tokens.push(e?.token);
    }
  }

  cancel(): void {
    this.modalRef.close();
  }

  sure(): void {
    if (this.reason.valid) {
      if (this.tokens.length > 0) {
        this.modalRef.close([this.reason.value, this.tokens]);
      } else {
        this.modalRef.close([this.reason.value]);
      }
    }
  }

  delete(i: number): void {
    this.images.splice(i, 1);
    this.tokens.splice(i, 1);
  }

  showDetail(data: string): void {
    this.zoom.open(IllustZoomModalComponent, {
      assets: [data],
      index: 0,
    });
  }
}
