import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Steps } from 'libs/peacha-core/src/lib/components/steps/steps';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';

@Component({
  selector: 'ivo-commission-payment-history',
  templateUrl: './commission-payment-history.page.html',
  styleUrls: ['./commission-payment-history.page.less'],
})
export class CommissionPaymentHistoryPage implements OnInit {
  @ViewChild(Steps) steps: Steps;

  identity: number;

  commissionFinalprice: number;

  stopTime: number;

  payList: {
    id: number;
    amount: number;
    channel: string;
    type: number;
    createTime: number;
    completeTime: number;
    payId: number;
  }[];

  refundList: {
    id: number;
    amount: number;
    channel: string;
    type: number;
    createTime: number;
    completeTime: number;
    payId: number;
  }[];

  detailList: {
    expectRate: number;
    amount: number;
    rateType: number;
  }[];

  constructor(
    private detail: CommissionDetailService,
    private api: CommissionApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.identity = this.detail.getIdentity();
    this.commissionFinalprice = Number(
      this.detail.getDetailValue().commission.finalPrice
    );
    this.stopTime =
      Number(this.detail.getDetailValue().commission.publishTime) +
      this.detail.getDetailValue().commission.day * 24 * 60 * 60 * 1000;

    this.api.orders(this.detail.getCommissionId()).subscribe((s) => {
      if (this.identity === 1) {
        this.payList = s.list.filter((l) => l.type != 20);
        this.refundList = s.list.filter((l) => l.type === 22);
      } else {
        this.payList = s.list.filter((l) => l.type === 20);
      }
      this.api.orderDetails(this.detail.getCommissionId()).subscribe((a) => {
        this.detailList = a.list;
        this.cdr.detectChanges();
        this.detailList?.forEach((d) => {
          if (d.rateType === 1 && this.refundList?.length > 0) {
            this.stopTime =
              Math.floor(
                (Number(this.refundList[0]?.completeTime) - this.stopTime) /
                  1000 /
                  60 /
                  60 /
                  24
              ) === 0
                ? 1
                : Math.floor(
                    (Number(this.refundList[0]?.completeTime) - this.stopTime) /
                      1000 /
                      60 /
                      60 /
                      24
                  );
          }
        });
      });
      this.cdr.detectChanges();
    });
  }
}
