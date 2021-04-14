import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { ModalRef, ModalService } from '@peacha-core';
import { PopTips, Steps } from '@peacha-core/components';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';



@Component({
    selector: 'ivo-n7r-order',
    templateUrl: './order.html',
    styleUrls: ['./order.less']
})
export class N7rOrder implements OnDestroy {
    @ViewChild(Steps) steps: Steps;

    page$ = new BehaviorSubject(0);

    list = [];
    count: number;

    type$ = new BehaviorSubject(0);
    indexId$ = new BehaviorSubject(0);
    scheduledTime: number;

    update$ = new BehaviorSubject(true);
    destroy$ = new Subject<void>();
    createOrderTime: number;

    money: number;
    status: number;

    constructor(
        private modalRef: ModalRef<N7rOrder>,
        private http: HttpClient,
        private scrollDispatcher: ScrollDispatcher,
        private cdr: ChangeDetectorRef,
        private modal: ModalService
    ) {

    }

    orderList$ = this.page$.pipe(
        switchMap(p => {
            return this.http.get<{
                count: number,
                list: any
            }>(`/shopmall/orders/goods/list?c=25&t=-1&p=${p}&s=10`).pipe(
                tap(s => {
                    this.count = s.count;
                    s.list.forEach(l => {
                        this.list.push(l);
                    });
                    this.cdr.detectChanges();
                })
            )
        })
    );


    addressDetail$ = this.indexId$.pipe(
        switchMap(id => {
            return this.http.get<any>(`/shopmall/express/address/detail?o=${id}`)
        })
    )

    detail$ = this.indexId$.pipe(
        switchMap(id => {
            return this.http.get<any>(`/shopmall/orders/detail?o=${id}`)
        })
    )

    scroll$ = this.scrollDispatcher
        .scrolled()
        .pipe(
            tap(scrollable => {
                if (scrollable) {
                    const scroll = scrollable as CdkScrollable;
                    if (scroll.measureScrollOffset('bottom') <= 0) {
                        if (this.count > this.list.length) {
                            this.page$.next(this.page$.value + 1);
                        }
                    }
                }
            })
        )
        .subscribe();





    close(): void {
        this.modalRef.close();
    }

    select(id: number, time: number, money: number, status: number, createTime: number): void {
        this.type$.next(1);
        this.indexId$.next(id);
        this.scheduledTime = time;
        this.money = money;
        this.status = status;
        this.createOrderTime = createTime;
    }

    pay(): void {
        this.update$.subscribe(is => {
            if (is) {
                this.http
                    .post<{ payId: number }>('/shopmall/orders/pay', {
                        o: [this.indexId$.value],
                        c: []
                    }).subscribe(s => {
                        this.http.get<{
                            channelId: number;
                            page: string;
                        }>(`/trade/pay/cashier/launch?channelId=1&payId=${s.payId}`).subscribe(
                            payResult => {
                                const div = document.createElement('divform');
                                div.innerHTML = payResult.page;
                                document.body.appendChild(div);
                                document.forms[0].setAttribute('target', '_blank');
                                document.forms[0].submit();
                                div.innerHTML = '';


                                //支付心跳
                                let heartbeatSub: Subscription;
                                if (heartbeatSub) {
                                    heartbeatSub.unsubscribe();
                                    heartbeatSub = undefined;
                                }
                                heartbeatSub = timer(1000, 3000)
                                    .pipe(
                                        switchMap(() => this.http.get<{
                                            status: number;
                                            cashiers: {
                                                status: number;
                                                error: string;
                                                channelId: number;
                                            }[];
                                            error: string;
                                        }>('/trade/pay/heartbeat', {
                                            params: {
                                                id: s.payId.toString(),
                                            },
                                        })),
                                        tap(heartbeat => {
                                            if ([2, 4, 5].includes(heartbeat.status)) {
                                                this.steps.goto('success');

                                            } else if ([3, 31, 32].includes(heartbeat.status)) {
                                                // this.modal
                                                //     .open(PopTips, [heartbeat.error, false])
                                                //     .afterClosed()
                                                //     .subscribe(_ => {


                                                //     });
                                                this.steps.goto('fail');
                                            }
                                        }),
                                        takeUntil(this.destroy$),
                                        takeWhile(heartbeat => heartbeat.status === 0 || heartbeat.status === 1)
                                    )
                                    .subscribe();
                            }
                        );
                    })
            } else {
                this.modal.open(PopTips, ['支付已超时，请重新发起支付', false]);
            }
        })


    }


    sureCancel(): void {
        this.http.post('/shopmall/orders/close', {
            o: [this.indexId$.value]
        }).subscribe(s => {
            this.modal.open(PopTips, ['取消订单成功', false, 1]).afterClosed().subscribe(_ => {
                this.modalRef.close();
            });
        }, e => {
            this.modal.open(PopTips, ['取消订单失败', false]);
        })
    }

    notCancel(): void {
        this.steps.goto('order');
        this.type$.next(1);

    }
    ngOnDestroy(): void {
        this.scroll$.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }

    orderTimeout() {
        this.update$.next(false);
    }

}
