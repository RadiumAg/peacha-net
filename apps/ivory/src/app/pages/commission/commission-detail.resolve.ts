import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CommissionApiService } from './service/commission-api.service';
import { CommissionDetailService } from './service/detail.service';

@Injectable()
export class CommissionDetailResolve implements Resolve<any> {
  constructor(
    private commission: CommissionApiService,
    private commissionDetail: CommissionDetailService
  ) {}

  resolve(route: import('@angular/router').ActivatedRouteSnapshot) {
    let id = route.queryParams.id;
    this.commissionDetail.setCommissionId(id);
    if (id) {
      return this.commission.detail(id).pipe(
        tap((s) => {
          this.commissionDetail.setDetailValue(s);
          this.commissionDetail.setCurrentNodeRate(
            s.nodeList[
              s.nodeList.findIndex((l) => l.status != 3) == 0
                ? 0
                : s.nodeList.findIndex((l) => l.status != 3) - 1
            ]?.rate
          );
          this.commissionDetail.setCommissionDay(s.commission.day);
        })
      );
    }
  }
}
