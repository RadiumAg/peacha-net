import { transition } from '@angular/animations';
import { Observable, BehaviorSubject, combineLatest, observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'ivo-user-linkage-time-page',
    templateUrl: './user-linkage-time-page.component.html',
    styleUrls: ['./user-linkage-time-page.component.less'],
})
export class UserLinkageTimePageComponent {
    constructor(
        private http: HttpClient,
        private translate: TranslateService
    ) {
    }

    info$ = (this.http.get('/link/v1/client/info') as Observable<{
        surplus_second: string;
        expiry: number;
        max_time: number;
    }>).pipe(
        map((_) => {
            let maxTime = `${0}时${0}分`;
            let surplusSecond = `${0}时${0}分`;
            let online = false;
            if (_.max_time > 0) {
                online = true;
                const t = (_.max_time - Date.now()) / 1000;
                const h = Math.floor(t / 60 / 60);
                const m = Math.floor((t % 3600) / 60);
                const s = Math.floor(t % 60);
                if (_.max_time > Date.now()) {
                    maxTime = `${h}
                               ${this.getTranslate('common.hours')}
                               ${m}
                               ${this.getTranslate('common.minutes')}
                               ${s}
                               ${this.getTranslate('common.seconds')}`;
                }
            }
            if (parseInt(_.surplus_second, 10) > 0) {
                const h = Math.floor(parseInt(_.surplus_second, 10) / 60 / 60);
                const m = Math.floor((parseInt(_.surplus_second, 10) % 3600) / 60);
                const s = Math.floor(parseInt(_.surplus_second, 10) % 60);
                surplusSecond = `${h}
                                  ${this.getTranslate('common.hours')}
                                  ${m}
                                  ${this.getTranslate('common.minutes')}
                                  ${s}
                                  ${this.getTranslate('common.seconds')}`;
            }
            return {
                surplusSecond,
                expiry: _.expiry > Date.now() ? _.expiry : null,
                maxTime,
                online,
                surplus_second: _.surplus_second,
                max_time: _.max_time
            };
        })
    );

    page$ = new BehaviorSubject<number>(1);

    log$ = combineLatest([this.page$])
        .pipe(
            switchMap(([page]) => {
                return this.http.get(
                    `/link/v1/client/uselog?p=${page - 1}&s=10`
                ) as Observable<{
                    count: number;
                    list: [
                        {
                            starttime: number;
                            endtime: number;
                            second: number;
                            number: number;
                            magnification: number
                        }
                    ];
                }>;
            })
        );

    getEstimatedTime(maxTime: number, surplusSecond: number, isOnline: boolean) {
        if (maxTime > 0) {
            maxTime = Math.floor(maxTime / 2);
            const t = (maxTime - Date.now()) / 1000;
            const h = Math.floor(t / 60 / 60);
            const m = Math.floor((t % 3600) / 60);
            const s = Math.floor(t % 60);
            if (maxTime > Date.now()) {
                return `${h}
                         ${this.getTranslate('common.hours')}
                         ${m}
                         ${this.getTranslate('common.minutes')}
                         ${s}
                         ${this.getTranslate('common.seconds')}`;
            }
        }
        if (Number(surplusSecond) > 0) {
            surplusSecond = Math.floor(surplusSecond / 2);
            const h = Math.floor(surplusSecond / 60 / 60);
            const m = Math.floor((surplusSecond % 3600) / 60);
            const s = Math.floor(surplusSecond % 60);
            return `${h}
                     ${this.getTranslate('common.hours')}
                     ${m}
                     ${this.getTranslate('common.minutes')}
                     ${s}
                     ${this.getTranslate('common.seconds')}`;
        }
    }

    private getTranslate(key: string) {
        let result;
        this.translate.get(key).subscribe((x) => {
            result = x;
        });
        return result;
    }
}
