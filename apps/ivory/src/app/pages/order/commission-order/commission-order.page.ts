import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopMallApiService } from '@peacha-core';
import { switchMap, take, tap } from 'rxjs/operators';



@Component({
    selector: 'ivo-commission-order',
    templateUrl: './commission-order.page.html',
    styleUrls: ['./commission-order.page.less'],
})
export class CommissionOrderPage {

    coupons = [];

    checkCouponId = null;
    commissionName: string;
    commissionPrice: number;
    commissionId: number;

    dotList;

    currentPage = 0;

    finallPrice = 0;
    freeMoney = 0;
    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private shopApi: ShopMallApiService
    ) {

        this.route.queryParams.pipe(take(1)).subscribe(p => {
            this.commissionId = p.cid;
            this.http.get<{
                commission: {
                    name: string;
                    finalPrice: number;
                };
            }>(`/commission/detail?c=${p.cid}`).subscribe(s => {
                this.commissionName = s.commission.name;
                this.commissionPrice = s.commission.finalPrice;
                this.finallPrice = this.commissionPrice;
                this.cdr.detectChanges();
            })
        });

    }

    getCoupon$ = this.route.queryParams.pipe(
        switchMap(p => {

            return this.shopApi.couponsList('peacha.commission', (p.p ? p.p - 1 : 0), 3).pipe(
                tap(s => {
                    this.currentPage = p.p ?? 1;
                    this.coupons = s.list;
                    this.dotList = new Array(Math.ceil(s.count / 4)).fill(1);
                    this.cdr.detectChanges();
                })
            );

        })
    ).subscribe()



    checked(id: number, effect: { discountAmount: number, discountRate: number, fullAmount: number, maxDiscountAmount: number, type: number }): void {
        if (id != this.checkCouponId) {
            this.checkCouponId = id;
            if (effect.type === 1) {
                this.finallPrice = this.commissionPrice * effect.discountRate;
                this.freeMoney = this.commissionPrice - this.finallPrice;
                this.cdr.detectChanges();
            } else {
                if (this.commissionPrice >= effect.fullAmount) {
                    this.finallPrice = this.commissionPrice - effect.discountAmount;
                    this.freeMoney = effect.discountAmount;
                    this.cdr.detectChanges();
                }

            }
        } else {
            this.checkCouponId = null;
            this.finallPrice = this.commissionPrice;
            this.freeMoney = 0;
            this.cdr.detectChanges();
        }

    }

    toPay(): void {

        this.route.queryParams.subscribe(params => {
            let param: { o: any[]; c?: any[] };
            if (this.checkCouponId === null) {
                param = { o: [params.orderId], c: [] };
            } else {
                param = {
                    o: [params.orderId],
                    c: [this.checkCouponId]
                };
            }
            // this.http.post<{ payId: number, pageRoute: string }>('/shopmall/orders/pay', param).subscribe(s => {
            //     this.router.navigate(['/pay'], {
            //         queryParams: {
            //             tradeId: s.payId,
            //             id: this.commissionId
            //         }
            //     })
            // })

            this.shopApi.orderPay(param).subscribe(s => {
                this.router.navigate(['/pay'], {
                    queryParams: {
                        tradeId: s.payId,
                        id: this.commissionId
                    }
                })
            })
        })


    }


    pre(): void {
        this.router.navigate([], {
            queryParams: {
                p: Number(this.currentPage) - 1
            },
            queryParamsHandling: 'merge'
        })


    }


    next(): void {

        this.router.navigate([], {
            queryParams: {
                p: Number(this.currentPage) + 1
            },
            queryParamsHandling: 'merge'
        })

    }

}
