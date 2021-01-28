import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CommissionDetail } from '../../../model/commission-detail';
import { CommissionApiService } from '../../../service/commission-api.service';
import { CommissionDetailService } from '../../../service/detail.service';

@Component({
  selector: 'ivo-commission-top-nav',
  templateUrl: './commission-top-nav.html',
  styleUrls: ['./commission-top-nav.less'],
})
export class CommissionTopNav implements OnInit {
  @Input() isShowRight?: boolean;
  @Input() isShowDetail: boolean;

  commission: CommissionDetail;
  commissionId: number;

  status$ = this.detail.commissionStatus$;

  constructor(
    private detail: CommissionDetailService,
    private api: CommissionApiService
  ) {}

  clickEvent(): void {
    this.api.commissionStatus(this.detail.getCommissionId()).subscribe((s) => {
      this.detail.commissionStatus$.next(s.status);
    });
  }

  ngOnInit(): void {
    this.commission = this.detail.getDetailValue();
    this.commissionId = this.detail.getCommissionId();
  }
}
