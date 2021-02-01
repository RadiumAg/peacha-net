import { Directive, Input, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, empty, Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, take, tap } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { UserState } from 'src/app/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { ModalService } from 'src/app/core/service/modals.service';
import { PopTips } from 'src/app/components/pop-tips/pop-tips';

@Directive({
    selector: '*[ivo-follow]',
    exportAs: 'follow'
})
export class FollowDirective {


    user$ = new BehaviorSubject<number>(0);
    follow$ = new BehaviorSubject<EFollowState>(0);
    // requesting$ = new BehaviorSubject<boolean>(false);

    @Input('follow-id')
    set user(v: number) {
        this.user$.next(v);
    }

    @Input('follow-state')
    set state(v: EFollowState) {
        this.follow$.next(v);
    }


    @Select(UserState.id)
    id$: Observable<number>;

    constructor(private http: HttpClient, private store: Store, private router: Router, private platform:PlatformLocation,private modal:ModalService) {
    }

    @HostListener('click')
    request() {
        combineLatest(
            this.follow$,
            // this.requesting$,
            this.user$,
            this.id$
        ).pipe(
            take(1),
            switchMap(([state, user, id]) => {
                if (id > 0) {
                    if (user == id) {
                        let a="不能够自己关注自己哦！"
                        this.modal.open(PopTips,[a,false])
                        return empty();
                    } else {
                        return this.http.get(`/api/v1/user/follow?u=${user}`).pipe(
                            tap((v: {
                                follow_state: number
                            }) => {

                                if (state == EFollowState.None) {
                                    return this.follow$.next(v.follow_state);
                                } else {
                                    return this.follow$.next(EFollowState.None);
                                }


                            })
                        );
                    }
                } else {
                    this.router.navigate(['/api/v1/passport/login'],{
                        queryParams:{
                            return:this.platform.pathname
                        }
                    });
                    return empty();
                }

                // if (state == EFollowState.None) {
                //     this.requesting$.next(true);
                //     return this.http.get<any>(`/user/follow?u=${user}`).pipe(
                //         tap((v:{
                //             follow_state:number
                //         }) => {
                //             // TODO
                //             this.follow$.next(v.follow_state);
                //         })
                //     );
                // } else {
                //     return this.http.get(`/user/unfollow?u=${user}`).pipe(
                //         tap(_ => {
                //             this.follow$.next(EFollowState.None)
                //         })
                //     );
                // }


            }),
            // tap(_ => {
            //     this.requesting$.next(false);
            // })
        ).subscribe(_ => {
            // fire and forget
        });
    }
}

export enum EFollowState {
    None = 0,
    Following = 1,
    Each = 2
}
