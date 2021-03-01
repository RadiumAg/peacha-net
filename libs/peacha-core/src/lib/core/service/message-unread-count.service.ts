import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable, BehaviorSubject } from 'rxjs';
import { Select } from '@ngxs/store';
import { UserState } from '../state/user.state';

@Injectable()
export class MessageUnreadCountService {
    @Select(UserState.isLogin)
    isLogin$: Observable<boolean>;

    constructor(private http: HttpClient) { }

    replyCount$ = new BehaviorSubject(0);
    likeCount$ = new BehaviorSubject(0);
    systemCount$ = new BehaviorSubject(0);
    bulletinCount$ = new BehaviorSubject(0);
    allCount$ = new BehaviorSubject(0);

    getUnreadCount(): void {
        this.isLogin$.subscribe(is => {
            if (is) {
                timer(0, 20000).subscribe(_t => {
                    const pms = ['Peacha0', 'Peacha1', 'Peacha2', 'Peacha3'];

                    this.http.get<{ list: Array<{ platform: string, count: number }> }>(`/notice/query/unread/count`, {
                        params: {
                            pms
                        }
                    }).subscribe(s => {
                        this.replyCount$.next(Number(s.list.filter(l => l.platform === 'Peacha0')[0]?.count));
                        this.likeCount$.next(Number(s.list.filter(l => l.platform === 'Peacha1')[0]?.count));
                        this.systemCount$.next(Number(s.list.filter(l => l.platform === 'Peacha2')[0]?.count));
                        this.bulletinCount$.next(Number(s.list.filter(l => l.platform === 'Peacha3')[0]?.count));
                        // eslint-disable-next-line max-len
                        this.allCount$.next(this.replyCount$.value + this.likeCount$.value + this.systemCount$.value + this.bulletinCount$.value);
                    })
                });
            }
        });
    }
}
