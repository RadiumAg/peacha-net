import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SharedService } from '../live-manager/live.service';
import { Router } from '@angular/router';
import { MemberApiService } from '../../member-api.service';
import { switchMap, tap } from 'rxjs/operators';


@Component({
    selector: 'ivo-3d-manager',
    templateUrl: './3d-manager.page.html',
    styleUrls: ['./3d-manager.page.less'],
})
export class ThreeDManagerPage {
    key: FormControl = new FormControl('');
    refresh$ = new BehaviorSubject(1);

    constructor(
        private memberApi: MemberApiService,
        private _sharedService: SharedService,
        private router: Router
    ) { }

    re$ = this._sharedService.changeEmitted$
        .pipe(
            tap(_s => {
                this.refresh$.next(1);
            })
        )
        .subscribe();

    countList$ = this.refresh$.pipe(
        switchMap(_s => {
            return this.memberApi.getCreateWorksCount(2);
        })
    );

    keyword() {
        this.router.navigate([], {
            queryParams: {
                k: this.key.value,
                p: 1,
            },
            queryParamsHandling: 'merge',
        });
    }

}
