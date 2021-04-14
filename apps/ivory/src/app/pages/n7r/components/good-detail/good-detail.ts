import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { ModalRef, ModalService, MODAL_DATA_TOKEN, UserState } from '@peacha-core';
import { PopTips, Steps } from '@peacha-core/components';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AddressSelect } from '../addressSelect/addressSelect';


type Good = {
    id: number;
    price: number;
    discountAmount: number;
    name: string;
    description: string;
    stock: number;
    salesVolumes: number;
    cover: string;
    month: number;
}


@Component({
    selector: 'ivo-n7r-good-detail',
    templateUrl: './good-detail.html',
    styleUrls: ['./good-detail.less']
})
export class N7rGoodDetail implements OnDestroy {
    @Select(UserState.isLogin)
    isLogin$: BehaviorSubject<boolean>;

    @ViewChild(Steps) steps: Steps;

    @ViewChild('selectInput') inputValue: HTMLInputElement;

    infoForm: FormGroup;

    suitPic = [
        '/assets/image/n7r/suit/2.png',
        '/assets/image/n7r/suit/3.png',
        '/assets/image/n7r/suit/7.png',
        '/assets/image/n7r/suit/8.png',
        '/assets/image/n7r/suit/9.png',
        '/assets/image/n7r/single/1.png',
        '/assets/image/n7r/single/5.png',
        '/assets/image/n7r/single/6.png',
        '/assets/image/n7r/single/8.png',
        '/assets/image/n7r/single/9.png',
    ];

    btnType$ = new BehaviorSubject(0);
    indexGood: Good;

    indexChoice: number;
    count$ = new BehaviorSubject(1);
    destroy$ = new Subject<void>();
    update$ = new BehaviorSubject(true);

    indexCity: any;

    orderId: number;
    createOrderTime: number;

    goodlist: any;

    constructor(
        private modalRef: ModalRef<N7rGoodDetail>,
        @Inject(MODAL_DATA_TOKEN) public date: { type: number, good: { list: Array<Good> } },
        private http: HttpClient,
        private fb: FormBuilder,
        private modal: ModalService,
        private router: Router
    ) {


        this.infoForm = this.fb.group(
            {
                name: new FormControl('', [Validators.required, Validators.maxLength(20)]),
                phone: new FormControl('', [Validators.required, Validators.pattern('^1[345789]\\d{9}$')]),
                city: new FormControl('', [Validators.required]),
                email: new FormControl('', [
                    Validators.required,
                    Validators.pattern('^\\w+((-\\w+)|(\\.\\w+))*@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$'),
                    Validators.maxLength(50)]),
                address: new FormControl('', [Validators.required, Validators.maxLength(200)]),
            }
        );

        this.http.get<{
            list: {
                id: number;
                price: number;
                discountAmount: number;
                name: string;
                description: string;
                stock: number;
                salesVolumes: number;
                cover: string;
                month: number;
            }[]
        }>(`/advance/goods_list`).subscribe(good => {
            this.goodlist = good;
            this.indexChoice = this.date.type === 2 ? good.list.length - 1 : 0;
            this.indexGood = good.list[this.indexChoice];
        })
    }

    get name(): AbstractControl {
        return this.infoForm.get('name');
    }
    get phone(): AbstractControl {
        return this.infoForm.get('phone');
    }
    get email(): AbstractControl {
        return this.infoForm.get('email');
    }
    get address(): AbstractControl {
        return this.infoForm.get('address');
    }
    get city(): AbstractControl {
        return this.infoForm.get('city');
    }
    close(): void {
        this.modalRef.close();
    }

    goto(stock: number): void {
        this.isLogin$.subscribe(is => {
            if (is) {
                // if (1618459200000 <= new Date().getTime()) {
                if (this.btnType$.value === 0 && this.count$.value > 0) {
                    if (stock > 0 && stock >= this.count$.value) {
                        if (this.indexChoice === this.date.good.list.length - 1) {
                            this.http.get(`/advance/check_order`).subscribe(_ => {
                                this.steps.goto('order');
                                this.btnType$.next(this.btnType$.value + 1);
                            }, e => {
                                if (e.code === 403) {
                                    this.modal.open(PopTips, ['需购买动捕套餐后才可购买单个追踪器', false]);
                                } else if (e.code === 20000) {
                                    this.modal.open(PopTips, ['库存不足无法购买', false]);
                                }
                            })
                        } else {
                            this.steps.goto('order');
                            this.btnType$.next(this.btnType$.value + 1);
                        }
                    } else {
                        this.modal.open(PopTips, ['库存不足无法购买', false]);
                    }


                } else if (this.btnType$.value === 1) {
                    if (this.infoForm.valid) {

                        this.http.post<{ orderId: number }>(`/advance/create_order`, {
                            g: this.indexGood.id,
                            nu: this.count$.value,
                            pi: this.indexCity?.one?.id,
                            ci: this.indexCity?.two?.id,
                            coi: this.indexCity?.three?.id,
                            si: this.indexCity.four.id ?? '',
                            ad: this.infoForm.value.address,
                            ph: this.infoForm.value.phone,
                            e: this.infoForm.value.email,
                            n: this.infoForm.value.name
                        }).subscribe(s => {
                            this.orderId = s.orderId;
                            this.steps.goto('pay');
                            this.btnType$.next(this.btnType$.value + 1);
                            this.createOrderTime = new Date().getTime();
                        }, e => {
                            if (e.code === 20000) {
                                this.modal.open(PopTips, ['库存不足无法购买', false]).afterClosed().subscribe(_ => {
                                    this.modalRef.close();
                                });
                            }
                        })



                    } else {
                        this.modal.open(PopTips, ['请填写完整有效的收获信息', false]);
                    }

                } else {
                    this.modalRef.close();
                }
                // } else {
                //     this.modal.open(PopTips, ['2021年4月15日 12:00 开始预售', false]);
                // }
            } else {
                this.modalRef.close();
                this.router.navigate(['login'], {
                    queryParams: {
                        return: 'n7r',
                    },
                });
            }
        })



    }

    selectAddress(el: ElementRef): void {
        this.modal.openFloat(AddressSelect, el, null, true).afterClosed().subscribe((s: any) => {
            this.indexCity = s;
            this.city.setValue(s);
        })
    }

    pay(): void {
        this.update$.subscribe(is => {
            if (is) {
                this.http
                    .post<{ payId: number }>('/shopmall/orders/pay', {
                        o: [this.orderId],
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
                                                this.btnType$.next(-1);
                                                this.steps.goto('success');

                                            } else if ([3, 31, 32].includes(heartbeat.status)) {
                                                // this.modal
                                                //     .open(PopTips, [heartbeat.error, false])
                                                //     .afterClosed()
                                                //     .subscribe(_ => {


                                                //     });
                                                this.btnType$.next(-1);
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

    orderTimeout() {
        this.update$.next(false);
    }

    cancel(): void {
        this.steps.goto('cancel');
        this.btnType$.next(3);
    }

    sureCancel(): void {
        this.http.post('/shopmall/orders/close', {
            o: [this.orderId]
        }).subscribe(s => {
            this.modal.open(PopTips, ['取消订单成功', false, 1]).afterClosed().subscribe(_ => {
                this.modalRef.close();
            });
        }, e => {
            this.modal.open(PopTips, ['取消订单失败', false]);
        })
    }

    notCancel(): void {
        this.btnType$.next(2);
        this.steps.goto('pay');
    }



    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    select(
        item: Good,
        index: number
    ): void {
        this.indexGood = item;
        this.indexChoice = index;
    }

    changeValue(t: any): void {
        if (t <= this.indexGood.stock - this.indexGood.salesVolumes) {
            this.count$.next(this.indexGood.stock - this.indexGood.salesVolumes);
        } else {
            this.count$.next(t);
        }

    }

}
