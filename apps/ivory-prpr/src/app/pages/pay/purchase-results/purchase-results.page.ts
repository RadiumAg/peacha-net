import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, timer, Subject, BehaviorSubject } from 'rxjs';
import { tap, takeUntil, switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ModalService } from 'src/app/core/service/modals.service';
import { NoResult } from './no-result/no-resule';



type OrderState = {
    list: {
        orderid: number,
        workid: number,
        work_name: string,
        goodsid: number,
        goods_name: string,
        cover: string,
        price: number,
        sellerid: number,
        seller_name: string,
        createtime: number,
        completetime: number,
        state: number,
        maxstock: number
    }[]
}
@Component({
    selector: 'ivo-purchase-results',
    templateUrl: './purchase-results.page.html',
    styleUrls: ['./purchase-results.page.less']
})
export class PurchaseResultsPage implements OnInit, OnDestroy {

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private modal: ModalService
    ) { }
    show$ = new BehaviorSubject<boolean>(true);
    destroy$ = new Subject<void>();

    showTip = false;

    order: {
        list: {
            orderid: number,
            workid: number,
            work_name: string,
            goodsid: number,
            goods_name: string,
            cover: string,
            price: number,
            sellerid: number,
            seller_name: string,
            createtime: number,
            completetime: number,
            state: number,
            maxstock: number
        }[]
    };
    ngOnInit(): void {
        combineLatest([
            this.route.queryParams,
            timer(1000, 2000)
        ]).pipe(
            take(30),
            switchMap(([params, i]) => {
                if (i == 29) {
                    this.modal.open(NoResult);
                }
                return this.http.post<OrderState>('/api/v1/mall/order_state', {
                    o: JSON.parse(params.orderId)
                });
            }),
            tap(s => {
                if (!s.list.some(item => item.state == 0 || item.state == 2)) {
                    this.show$.next(false);
                    this.order = s;
                    this.destroy$.next();
                    this.destroy$.complete();
                    if (s.list.some(item => item.state == 4 || item.state == 5)) {
                        this.showTip = true;
                    }
                }
            }),
            takeUntil(this.destroy$),
        ).subscribe(_ => {

        });

    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }


    /**
     * @author kinori
     * @description 路由到订单第一个作品
     * @version 2020/11/6
     */
    next() {
        // 路由中添加Id,失败订单跳转会存在问题
        this.router.navigateByUrl('/store');
    }

}
