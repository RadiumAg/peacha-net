import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SharedService } from '../../live-manager/live.service';
import { MemberApiService } from '../../../member-api.service';



@Component({
    selector: 'ivo-3d-success',
    templateUrl: './3d-success.page.html',
    styleUrls: ['./3d-success.page.less'],
})
export class ThreeDSuccessPage {
    showList = [];
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _sharedService: SharedService,
        private memberApi: MemberApiService
    ) { }

    update$ = new BehaviorSubject(true);
    currentPage$ = new BehaviorSubject(1);

    works$ = combineLatest([this.update$, this.route.queryParams]).pipe(
        switchMap(([_up, params]) => {
            return this.memberApi.getCreateWork(params.k, params.p, 6, 2)
                .pipe(
                    tap(s => {
                        this.showList = s.list;
                        s.list.map(l => {
                            l.time = l.publishTime + 7 * 24 * 60 * 60 * 1000 - Date.now();
                        });
                        this.currentPage$.next(params.p ?? 1);
                    })
                );
        })
    );
    toPage(p: number) {
        this.router.navigate([], {
            queryParams: {
                p: p,
            },
            queryParamsHandling: 'merge',
        });
        document.documentElement.scrollTop = 0;
    }

    changePage() {
        this.router.navigate([], {
            queryParams: {
                p: 1,
            },
            queryParamsHandling: 'merge',
        });
    }

    ll(i: boolean) {
        if (i) {
            if (this.showList.length == 1 && this.currentPage$.value > 1) {
                this.toPage(this.currentPage$.value - 1);
                this._sharedService.emitChange(1);
            } else {
                this.update$.next(false);
                this._sharedService.emitChange(1);
            }
        }
    }
}
