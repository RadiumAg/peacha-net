import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, timer, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState } from '../state/user.state';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';


@Injectable()
export class CustomerService {
    @Select(UserState.isLogin)
    isLogin$: Observable<boolean>;


    // isCount$ = new BehaviorSubject(true);
    // isMessage$ = new BehaviorSubject(false);
    constructor(private http: HttpClient) {

    }


    // changeCount(num: boolean) {
    //     this.isCount$.next(num);
    //     if(!num){
    //         this.one$.unsubscribe()
    //     }
    // }

    // changeMessage(num: boolean) {
    //     this.isMessage$.next(num);
    //     if(!num){
    //         this.two$.unsubscribe
    //     }
    // }


    count() {

        this.isLogin$.subscribe(is => {
            if (is) {
                timer(1000, 60000).subscribe(t => {
                    this.http.get<{ count: number }>('/api/v1/webim/unread_count').subscribe(l => {
                        this.unreadCounnt = l.count;
                    })
                })
            }
        })
    }
    unreadCounnt: number = 0;
    unreadMessage$ = new BehaviorSubject([]);


    Message(){

            this.isLogin$.subscribe(s => {
            if (s) {
                timer(1000, 10000).subscribe(t => {
                    this.http.get<{ list: { sender_id: number, sender_avatar: string, speaktime: string, message: string, type: number, readstate: number }[] }>('/api/v1/webim/unread').subscribe(l => {
                        this.unreadMessage$.next(l.list)
                    })
                })
            }
        })
    }


}
