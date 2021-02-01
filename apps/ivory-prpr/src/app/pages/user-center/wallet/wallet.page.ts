import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    Observable,
    combineLatest,
    BehaviorSubject,
    Subscription,
    empty,
    interval,
    Subject,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, startWith, filter, tap, take } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Store, Select } from '@ngxs/store';
import { Steps } from 'src/app/components/steps/steps';
import { UserState } from 'src/app/core/state/user.state';
import { ModalService } from 'src/app/core/service/modals.service';
import { PopTips } from 'src/app/components/pop-tips/pop-tips';

type walletInfo = {
    amount: number;
    count: number;
    list: [
        {
            id: number;
            start_time: number;
            amount: number;
            app: number;
            goods_names: string;
        }
    ];
};

@Component({
    selector: 'ivo-wallet',
    templateUrl: './wallet.page.html',
    styleUrls: ['./wallet.page.less'],
})
export class WalletPage {
    @Select(UserState.identity_state)
    identity_state$: Observable<number>;

    a = new Date();
    date: FormControl = new FormControl(new Date());
    key: FormControl = new FormControl('');
    isHelpShow = false;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store,
        private modal: ModalService
    ) {}
    @ViewChild(Steps) steps: Steps;

    toWithdraw() {
        this.identity_state$
            .pipe(
                take(1),
                tap((s) => {
                    if (s != 2) {
                        this.modal.open(PopTips, [
                            '提现需通过实名认证，请前往个人中心进行实名认证',
                            false,
                        ]);
                    } else {
                        this.router.navigate(['/wallet/withdraw']);
                    }
                })
            )
            .subscribe();
    }
    update$ = new BehaviorSubject<number>(0);
    refresh() {
        this.update$.next(1);
    }

    handleDatePanelChange(mode: string): void {}
    type$ = this.route.queryParams.pipe(
        map((r) => {
            return r.t ?? 1;
        })
    );

    page$ = new BehaviorSubject<number>(0);

    account$: Observable<{
        is_usable: boolean;
        balance: number;
        cashout: number;
    }> = combineLatest(this.update$).pipe(
        switchMap((s) => {
            return this.http.get<any>(`/api/v1/wallet/info`);
        })
    );

    wallet$ = combineLatest(
        this.route.queryParams,
        this.date.valueChanges.pipe(startWith(new Date())),
        this.update$
    ).pipe(
        switchMap(([r]) => {
            if (r.t == 1 || r.t == null) {
                return this.http
                    .get<walletInfo>(
                        `/api/v1/wallet/record/list/pay?m=${formatDate(
                            this.date.value as Date,
                            'yyyy-MM-dd',
                            'zh-cn'
                        )}&p=${r.p ? r.p - 1 : 0}&s=7`
                    )
                    .pipe(
                        tap((s) => {
                            this.page$.next(r.p ?? 1);
                        })
                    );
            } else if (r.t == 2) {
                return this.http
                    .get<{
                        amount: number;
                        count: number;
                        list: [
                            {
                                id: number;
                                amuont: number;
                                goods_names: string;
                                work_names: string;
                                credited_time: string;
                                app: number;
                            }
                        ];
                    }>(
                        `/api/v1/wallet/record/list/income?m=${formatDate(
                            this.date.value as Date,
                            'yyyy-MM-dd',
                            'zh-cn'
                        )}&p=${r.p ? r.p - 1 : 0}&s=7`
                    )
                    .pipe(
                        tap((s) => {
                            this.page$.next(r.p ?? 1);
                        })
                    );
            } else if (r.t == 3) {
                return this.http
                    .get<{
                        amount: number;
                        count: number;
                        list: [
                            {
                                id: number;
                                start_time: number;
                                amount: number;
                                status: number;
                            }
                        ];
                    }>(
                        `/api/v1/wallet/record/list/cashout?m=${formatDate(
                            this.date.value as Date,
                            'yyyy-MM-dd',
                            'zh-cn'
                        )}&p=${r.p ? r.p - 1 : 0}&s=7`
                    )
                    .pipe(
                        tap((s) => {
                            this.page$.next(r.p ?? 1);
                        })
                    );
            } else if (r.t == 4) {
                // return this.http
                //     .get<{
                //         count: number;
                //         list: [
                //             {
                //                 id: number;
                //                 start_time: number;
                //                 amount: number;
                //             }
                //         ];
                //     }>(
                //         `/wallet/record/list/recharge?m=${formatDate(
                //             this.date.value as Date,
                //             'yyyy-MM-dd',
                //             'zh-cn'
                //         )}&p=${r.p ? r.p - 1 : 0}&s=7`
                //     )
                //     .pipe(
                //         tap((s) => {
                //             this.page$.next(r.p ?? 1);
                //         })
                //     );
            } else if (r.t == 5) {
                return this.http
                    .get<{
                        amount: number;
                        count: number;
                        list: [
                            {
                                id: number;
                                start_time: number;
                                amount: number;
                                status: number;
                                goods_names: string;
                                app: number;
                            }
                        ];
                    }>(
                        `/api/v1/wallet/record/list/refund?m=${formatDate(
                            this.date.value as Date,
                            'yyyy-MM-dd',
                            'zh-cn'
                        )}&p=${r.p ? r.p - 1 : 0}&s=7`
                    )
                    .pipe(
                        tap((s) => {
                            this.page$.next(r.p ?? 1);
                        })
                    );
            }
            return empty();
        })
    );

    help() {
        this.isHelpShow = !this.isHelpShow;
    }

    // jump(app: number, data: number) {
    //     switch (app) {
    //         case 0:
    //             this.router.navigate(['/setting/wallet/withdrawdetail'], {
    //                 queryParams: {
    //                     id: data,
    //                 },
    //             });
    //             break;
    //         case 1:
    //             this.router.navigate(['/setting/wallet/paydetail'], {
    //                 queryParams: {
    //                     id: data,
    //                 },
    //             });
    //             break;

    //         default:
    //             this.router.navigate(['/setting/wallet/orderdetail'], {
    //                 queryParams: {
    //                     o: data,
    //                 },
    //             });
    //     }
    // }

    page(data: number) {
        this.router.navigate([], {
            queryParams: {
                p: data,
            },
            queryParamsHandling: 'merge',
        });
        document.documentElement.scrollTop = 0;
    }

    keyword() {
        this.router.navigate([], {
            queryParams: {
                k: this.key.value,
                p: 1,
            },
            queryParamsHandling: 'merge',
        });
    }

    // toDetailOne(t: number, i: number) {
    //     if (t == 1) {
    //         this.router.navigate(['../setting/wallet/paydetail'], {
    //             queryParams: {
    //                 id: i
    //             }
    //         })
    //     } else if (t == 2) {
    //         this.router.navigate(['../setting/wallet/incomedetail'], {
    //             queryParams: {
    //                 id: i
    //             }
    //         })
    //     }
    // }
}
