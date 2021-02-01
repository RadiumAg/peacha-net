import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, timer, Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, startWith, take, map, withLatestFrom, shareReplay, takeWhile, takeUntil } from 'rxjs/operators';
import { Steps } from 'src/app/components/steps/steps';
import { ModalService } from 'src/app/core/service/modals.service';
import { PopTips } from 'src/app/components/pop-tips/pop-tips';
import { TradeInfo, TradeChannel } from './trade';
import { TradeApiService } from 'src/app/pages/pay/trade-api.service';
import { TranslateService } from '@ngx-translate/core';

const TimeOut = 300;

@Component({
    selector: 'ivo-pay',
    templateUrl: './pay.page.html',
    styleUrls: ['./pay.page.less'],
})
export class PayPage implements OnInit, OnDestroy {

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient,
        private modal: ModalService,
        private translate: TranslateService,
        private tradeApi: TradeApiService
    ) {

    }
    @ViewChild(Steps) steps: Steps;


    wallet$: Observable<number>;

    choice$ = new BehaviorSubject<Array<boolean>>([false, true, false]);

    tradeInfo$: Observable<TradeInfo> = this.route.queryParams.pipe(
        switchMap(s => {
            return this.tradeApi.payInfo(s.tradeId);
        }),
        shareReplay()
    );

    // tradeChannel$: Observable<TradeChannel> = this.route.queryParams.pipe(
    //     switchMap(s => {
    //         return this.tradeApi.channelList(s.tradeId);
    //     })
    // );


    ngOnInit() {
        let heartbeatSub: Subscription;
        this.route.queryParams.subscribe(s => {
            // 轮询
            if (heartbeatSub) {
                heartbeatSub.unsubscribe();
                heartbeatSub = undefined;
            }
            heartbeatSub = timer(1000, 3000).pipe(
                switchMap(() => this.tradeApi.payHeartbeat(s.tradeId)),
                tap(heartbeat => {
                    if ([2, 4, 5].includes(heartbeat.status)) {
                        this.router.navigate(['/setting']);
                    } else if ([3, 31, 32].includes(heartbeat.status)) {
                        this.modal.open(PopTips, [heartbeat.error, false]).afterClosed().subscribe(_ => {
                            this.router.navigate(['/setting']);
                        });
                    }
                }),
                takeUntil(this.destroy$),
                takeWhile(heartbeat => (heartbeat.status === 0 || heartbeat.status === 1))
            ).subscribe();
        });

    }

    // 用来判断选择支付方式页面倒计时五分钟是否完成
    show$ = new BehaviorSubject<boolean>(true);

    timer$ = timer(1000, 1000).pipe(
        withLatestFrom(this.tradeInfo$),
        take(TimeOut),
        map(([_, p]) => {
            const start = new Date(Number(p.startTime));
            const end = new Date(Date.now());
            const sumSecond = 60 - start.getSeconds() + end.getSeconds();
            let sumMinute: number;

            if (end.getMinutes() >= start.getMinutes()) {
                sumMinute = (end.getMinutes() - start.getMinutes()) * 60;
            } else {
                sumMinute = (60 + end.getMinutes() - start.getMinutes()) * 60;
            }
            if ((sumMinute + sumSecond - 60) < TimeOut) {
                this.show$.next(true);
                return Number(p.startTime) + TimeOut * 1000 - Date.now();

            } else {
                this.show$.next(false);
                return 0;
            }
        }),
        tap(time => {
            console.log(time)
        })
    );

    // 确定支付方式按钮
    next() {
        combineLatest([this.choice$, this.show$]).pipe(
            take(1),
            tap(([choice, s]) => {
                if (s) {    // 5分钟之内
                    if (choice[1] === true) {
                        this.steps.goto('qrcode');
                        this.payByAlipay();
                    } else {
                        this.steps.goto('wechatqrcode');
                        this.payByWechat();
                    }
                } else {        // 5分钟之后
                    this.modal.open(PopTips, [this.getTranslate('pay.transaction_close'), false]);
                }
            })
        ).subscribe();
    }

    goCart() {
        let a = this.getTranslate('pay.goback_tip');
        this.modal.open(PopTips, [a, true]).afterClosed().subscribe(s => {
            if (s) {
                this.route.queryParams.pipe(
                    tap(params => {
                        this.destroy$.next();
                        if (params.a == 0) {
                            this.router.navigate(['cart']);
                        } else {
                            this.router.navigate(['setting', 'order']);
                        }
                        this.tradeApi.payClose(params.tradeId)
                            .pipe(take(1)).subscribe();
                    })
                ).pipe(take(1)).subscribe();
            }
        });

    }
    destroy$ = new Subject<void>();

    private getTranslate(key) {
        let value;
        this.translate.get(key).subscribe((x) => {
            value = x;
        });
        return value;
    }


    payByAlipay() {
        this.route.queryParams.pipe(
            withLatestFrom(this.tradeInfo$),
            tap(([params]) => {
                // 获取二维码
                return this.tradeApi.payCashierLaunch(1, params.tradeId).subscribe(
                    payResult => {
                        const div = document.createElement('divform');
                        div.innerHTML = payResult.page;
                        document.body.appendChild(div);
                        document.forms[0].setAttribute('target', '_blank');
                        document.forms[0].submit();
                        div.innerHTML = '';
                    },
                    (e) => {
                        this.steps.goto('fali');
                    });
            })
        ).subscribe();
    }

    payByWechat() {
        this.route.queryParams.pipe(
            switchMap(s => {
                // console.log(s.tradeId);
                return this.http.post('/wallet/cashier/pay', {
                    id: s.tradeId,
                    channel: 2
                });
            })
        ).subscribe(
            // 轮询
        );
    }


    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }


    toOrderList() {
        this.router.navigate(['/pay/results'], { queryParamsHandling: 'preserve' });
    }

    goSelect() {
        this.steps.goto('select');
    }
}
