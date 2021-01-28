import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TradeApiService } from '../../../pay/trade-api.service';

@Component({
  selector: 'ivo-pay-record-detail',
  templateUrl: './pay-record-detail.page.html',
  styleUrls: ['./pay-record-detail.page.less'],
})
export class PayRecordDetailPage implements OnInit {
  constructor(
    private tradeapi: TradeApiService,
    private router: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}
  detail$ = combineLatest([this.router.params]).pipe(
    switchMap(([r]) => {
      return this.tradeapi.queryPayDetails(r.payid);
    })
  );

  toOrderDetail(i: string, p: string, id: string) {
    if (i.includes('企划')) {
      this.http
        .get<{ commissionId: number }>(`/commission/order/commission?o=${id}`)
        .subscribe((s) => {
          window.open(
            location.origin + '/commission/detail/payment?id=' + s.commissionId
          );
        });
    } else {
      window.open(p);
    }
  }
}
