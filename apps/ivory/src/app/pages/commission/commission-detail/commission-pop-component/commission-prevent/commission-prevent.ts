import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';
import { CommissionApiService } from '../../../service/commission-api.service';

@Component({
  selector: 'ivo-commission-prevent',
  templateUrl: './commission-prevent.html',
  styleUrls: ['./commission-prevent.less'],
  providers: [CommissionApiService],
})
export class CommissionPrevent implements OnInit {
  next = false;
  result: string;

  constructor(
    private modalRef: ModalRef<CommissionPrevent>,
    @Inject(MODAL_DATA_TOKEN) public key: { type: number; id: number },
    private api: CommissionApiService
  ) {}

  rate = new FormControl(0, [
    Validators.required,
    Validators.pattern('^(?:0|[1-9][0-9]?|100)$'),
  ]);

  ngOnInit(): void {}

  update(e: { process: number }): void {
    this.rate.setValue(Number(e.process * 100).toFixed(0));
  }

  cancel(): void {
    this.modalRef.close();
  }

  sure(): void {
    if (this.rate.valid) {
      if (!this.next) {
        this.api
          .discontinue(this.key.id, this.key.type, this.rate.value, '')
          .subscribe(
            (s) => {
              if (this.key.type === 0) {
                this.result = '已成功发起协商中止请求，等待对方处理。';
              } else if (this.key.type === 2) {
                this.result = '已成功发起平台介入中止，等待平台处理。';
              }

              this.next = true;
            },
            (e) => {
              if (e.code === 10701) {
                this.result = '中止企划申请失败，企划不存在';
              } else if (e.code === 10711) {
                this.result = '中止企划申请失败，存在未处理协商';
              } else if (e.code === 10722) {
                this.result = '无法发起超时中止';
              } else if (e.code === 10751) {
                this.result = '平台介入申请失败，存在未支付订单';
              }
              this.next = true;
            }
          );
      } else {
        this.modalRef.close(1);
      }
    }
  }
}
