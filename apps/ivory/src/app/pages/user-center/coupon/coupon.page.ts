import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopMallApiService } from '@peacha-core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'ivo-coupon',
  templateUrl: './coupon.page.html',
  styleUrls: ['./coupon.page.less']
})
export class CouponPage {

  page$ = new BehaviorSubject(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopApi: ShopMallApiService
  ) {

  }

  coupons$ = this.route.queryParams.pipe(
    switchMap(params => {

      return this.shopApi.couponsList('peacha.commission', (params.page ? params.page - 1 : 0), 4).pipe(
        tap(_ => {
          this.page$.next(params.page ?? 1);
        })
      )
    })
  )

  page(date: number) {
    this.router.navigate([], {
      queryParams: {
        page: date
      },
      queryParamsHandling: 'merge',
    })
  }
}
