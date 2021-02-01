import { Component, OnInit, } from '@angular/core';
import { combineLatest, Observable, BehaviorSubject, concat, of, from, } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, take, withLatestFrom, startWith, tap, shareReplay, delay, skipUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ModalService } from 'src/app/core/service/modals.service';
import { FormControl } from '@angular/forms';
import { PopTips } from 'src/app/components/pop-tips/pop-tips';

type OrderInfo = {
    count: number;
    list: {
        orderid: number;
        workid: number;
        work_name: string;
        work_cover: string;
        price: string;
        sellerid: number;
        seller_name: string;
        createtime: string;
        completetime: string;
        state: number;
    }[];
};

@Component({
    selector: 'ivo-order-list',
    templateUrl: './order-list.page.html',
    styleUrls: ['./order-list.page.less'],
})
export class OrderListPage implements OnInit {
    constructor(
        private modal: ModalService,
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
    ) {
    }
    key: FormControl = new FormControl();
    a: number[];
    page$ = new BehaviorSubject<number>(0);
    // page$ =this.route.queryParams.pipe(
    //     map(r=>{
    //         return r.p??1;
    //     })
    //     )
    type$ = this.route.queryParams.pipe(
        map(r => {
            return r.t ?? -1;
        })
    )

    select$ = new BehaviorSubject<Set<number>>(new Set());
    update$ = new BehaviorSubject<boolean>(false);
    order$: Observable<OrderInfo> = combineLatest(
        this.route.queryParams,
        this.update$
    ).pipe(
        //这里可以加一个untilwhile
        switchMap(([r]) => {
            return this.http.get<any>(
                `/mall/get_buy_order?k=${r.k ?? ''}&t=${r.t ?? -1}&p=${r.p ? r.p - 1 : 0}&s=4`
            ).pipe(
                tap(s => {
                    this.page$.next(r.p ?? 1)
                })
            )
        }),
        distinctUntilChanged(),
        shareReplay(0)
    );
    date = new Date;

    keyword() {
        this.router.navigate([], {
            queryParams: {
                k: this.key.value
            },
            queryParamsHandling: "merge"
        })
    }

    // 选择
    prices$ = this.select$.pipe(
        withLatestFrom(this.order$),
        map(([selected, order]) => {
            return order.list.filter(o => {
                return selected.has(o.orderid);
            }).map(o => Number(o.price)).reduce((a, b) => {
                return a + b;
            }, 0);
        }),
        startWith(0)
    );
    ngOnInit(): void {
    }
    cancel(orderid: number) {
        this.http.post('/api/v1/mall/cancel_order', { o: [orderid] }).subscribe(s => {
            this.update$.next(false);
        });
    }

    page(data: number) {
        this.select$.next(new Set())
        this.router.navigate([], {
            queryParams: {
                p: data
            },
            queryParamsHandling: "merge"
        })
        document.documentElement.scrollTop = 0;

    }

    // tag：0结算 1确认删除  2删除待支付 3删除退款中 4全部确认删除
    // 1 4 传入orderid
    delet(item: any) {
        if (item.state == 0) {
            this.modal.open(PopTips, ['待支付或退款中,订单无法删除，支付完毕或取消才可删除',false]);
        } else if (item.state == 4) {
            this.modal.open(PopTips, ['退款中,订单无法删除，需退款完毕后才可删除',false]);
        } else {
            this.modal.open(PopTips, ['是否确认删除订单，订单删除后无法找回',true]).afterClosed().subscribe(s => {
                if(s){
                    this.http.post('/api/v1/mall/delete_order', { o: [item.orderid]}).subscribe(_=>{
                        this.update$.next(false);
                    })
                }

            });
        }
    }

    skipdetail(orderid: number) {
        this.router.navigate(['/setting/order', orderid]);
    }

    toPay(id:number) {
        this.http.post<{ trade_id: number }>(
            '/mall/initiate_transaction',
            {
                o: [id],
            }
        ).subscribe(s=>{
            this.router.navigate(['../pay'], {
                queryParams: {
                    tradeId: s.trade_id,
                    a:1,
                    orderId:JSON.stringify([id])
                },
            });
        })
     }



}
