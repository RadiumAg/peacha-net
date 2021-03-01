import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { take, map } from 'rxjs/operators';
import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { PopTips } from '@peacha-core/components';
import { ModalService } from '@peacha-core';

@Component({
    selector: 'ivo-user-linkage-recharge-page',
    templateUrl: './user-linkage-recharge-page.component.html',
    styleUrls: ['./user-linkage-recharge-page.component.less'],
})
export class UserLinkageRechargePage {
    constructor(
        private modal: ModalService,
        private http: HttpClient,
        private router: Router
    ) {}

    goods$ = this.http
        .get<{
            list: {
                time: number;
                price: number;
                free: number;
            }[];
        }>('/link/v1/client/goods')
        .pipe(map((res) => res.list));

    checked$ = new BehaviorSubject(0);

    pay = () => {
        combineLatest([this.goods$, this.checked$])
            .pipe(take(1))
            .subscribe(([goods, check]) => {
                if (goods[check]) {
                    this.http
                        .post<{ trade_id: number }>(
                            '/link/v1/client/create_order',
                            {
                                h: goods[check].time,
                            }
                        )
                        .subscribe(
                            (s) => {
                                this.router.navigate(['../pay'], {
                                    queryParams: {
                                        tradeId: s.trade_id,
                                    },
                                });
                            },
                            (e) => {
                                this.modal.open(PopTips, ['未开放', false, 0]);
                            }
                        );
                } else {
                    this.modal.open(PopTips, ['未选择购买时长', false, 0]);
                }
            });
    };
}
