import { Directive, Input, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, empty, Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { switchMap, take, tap, catchError } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { UserState } from 'src/app/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';

@Directive({
    selector: '*[ivo-work-like]',
    exportAs: 'worklike'
})
export class WorkLikeDirective {


    work$ = new BehaviorSubject<number>(0);
    like$ = new BehaviorSubject<ELikeState>(0);
    // requesting$ = new BehaviorSubject<boolean>(false);

    @Input('work-id')
    set user(v: number) {
        this.work$.next(v);
    }

    @Input('like-state')
    set state(v: ELikeState) {
        this.like$.next(v);
    }


    @Select(UserState.id)
    id$: Observable<number>;

    constructor(private http: HttpClient, private store: Store,private router:Router,private platform:PlatformLocation) {
    }

    @HostListener('click')
    request() {
        combineLatest(
            this.like$,
            // this.requesting$,
            this.work$,
            this.id$
        ).pipe(
            take(1),
            switchMap(([state, work, id]) => {
                if(id>0){
                    return this.http.post(`/work/like_work`,{w:work}).pipe(
                        tap((v: {}) => {
                            if (state == ELikeState.None) {
                                return this.like$.next(ELikeState.Liked);
                            } else {
                                return this.like$.next(ELikeState.None);
                            }
                        })
                    );
                }else {
                    this.router.navigate(['/passport/login'],{
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

export enum ELikeState {
    None = 0,
    Liked = 1,
}
