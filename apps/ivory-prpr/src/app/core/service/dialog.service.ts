import { Injectable, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Select, Store } from '@ngxs/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ReplyUnreadCounnt, AddSession, AddHistroy, AddSessionOne, ReduceUnreadCounnt, RemoveSessionAll, RemoveHistroyAll, AddUnreadCounnt } from '../state/dialog.action';
import { UserState } from '../state/user.state';




@Injectable()
export class DialogStartService {
    token: string;
    nim: nim;

    @Select(UserState.id)
    userid$: Observable<number>;

    constructor(private http: HttpClient, private route: ActivatedRoute, private store: Store) {

    }

    box: ElementRef;
    content: ElementRef;

    start(hellobox?: ElementRef, box?: ElementRef) {
        this.box = hellobox;
        this.content = this.box;
        this.http.get<{ token: string }>(`/api/v1/webim/connect`).subscribe(
            (s) => {
                this.token = s.token;
                this.userid$.subscribe((id) => {
                    this.nim = NIM.getInstance({
                        debug: false,
                        appKey: '55fefdc0d5489b45ec442ad1e7bf0a1d',
                        account: String(id),
                        token: this.token,
                        db: true,
                        /**连接 */
                        onconnect: this.onConnect.bind(this),
                        onerror: this.onError.bind(this),
                        /**重连回调 */
                        onwillreconnect: this.onWillReconnect.bind(this),
                        ondisconnent: this.onDisconnect.bind(this),
                        /**多端登录状态变化的回调 */
                        onloginportschange: this.onLoginPortsChange.bind(this),
                        onSessions: this.onSessions.bind(this),
                        onupdatesession: this.onUpdateSession
                            .bind(this),
                        onmsg: this.onMsg.bind(this),
                        onSessionsWithMoreRoaming: this.onSessionsWithMoreRoaming.bind(this),
                        onsyncdone: this.onSyncDone.bind(this),
                        syncRoamingMsgs: true,
                        onroamingmsgs: this.onroamingmsgs.bind(this)
                    });
                });


            },
            //暂时能用，先用着，以后肯定要改这个结构
            (e) => {
                if (e.code == 500) {
                    this.http
                        .get<{ token: string }>(`/api/v1/webim/update_connect`)
                        .subscribe((s) => {
                            this.token = s.token;
                            this.userid$.subscribe(i => {
                                this.nim = NIM.getInstance({
                                    debug: false,
                                    appKey: '55fefdc0d5489b45ec442ad1e7bf0a1d',
                                    account: String(i),
                                    token: this.token,
                                    db: true,
                                    onconnect: this.onConnect.bind(this),
                                    onerror: this.onError.bind(this),
                                    onwillreconnect: this.onWillReconnect.bind(
                                        this
                                    ),
                                    ondisconnent: this.onDisconnect.bind(this),
                                    onloginportschange: this.onLoginPortsChange.bind(
                                        this
                                    ),
                                    onSessions: this.onSessions.bind(this),
                                    onupdatesession: this.onUpdateSession
                                        .bind(this),
                                    onmsg: this.onMsg.bind(this),
                                    onSessionsWithMoreRoaming: this.onSessionsWithMoreRoaming.bind(this),
                                    onsyncdone: this.onSyncDone.bind(this),
                                    syncRoamingMsgs: true,
                                    onroamingmsgs: this.onroamingmsgs.bind(this)
                                });
                            })

                        });
                }
            }
        );

    }


    onConnect() {
        console.log('连接成功');
        this.nim.getLocalSessions({
            limit: 20,
            done: this.getLocalSessionsDone.bind(this)
        })
    }



    onError(error: any, obj: any) {
        console.log('发生错误', error, obj);
    }
    onWillReconnect(obj: any) {
        // 此时说明 `SDK` 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
        console.log('即将重连', obj);
    }

    onDisconnect(error: any) {
        // 此时说明 `SDK` 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
        console.log('连接断开', error);
        if (error) {
            switch (error.code) {
                // 账号或者密码错误, 请跳转到登录页面并提示错误
                case 302:
                    break;
                // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
                case 417:
                    break;
                // 被踢, 请提示错误后跳转到登录页面
                case 'kicked':
                    break;
                default:
                    break;
            }
        }
    }
    onLoginPortsChange(loginPorts: any) {
        console.log('当前登录帐号在其它端的状态发生改变了', loginPorts);
    }

    getLocalSessionsDone(error: any, obj: any) {
        console.log('获取本地会话列表' + (!error ? '成功' : '失败'), error, obj);
        if (!error) {
            this.onSessions(obj.sessions);
        }

    }


    sessions$ = new BehaviorSubject<Session[]>([]);
    dialogList: Session[];
    dialogHistroy: any = [];

    nowunread: number = 0;

    sessionCount$ = new BehaviorSubject(0);
    sessionLastId$ = new BehaviorSubject('');
    onSessions(sessions: any) {
        console.log('收到会话列表', sessions);
        let s = this.nim.mergeSessions(
            this.sessions$.value,
            sessions
        )
        this.sessions$.next(s)
        this.dialogList = s;
        this.sessionCount$.next(s.length);
        this.sessionLastId$.next(this.dialogList[this.sessionCount$.value - 1]?.id);
        let aum: number = 0;
        let idlist: Array<number> = [];
        s.forEach((l: { unread: number, to: string }) => {
            aum += l.unread;
            idlist.push(Number(l.to))
        });

        this.store.dispatch(new ReplyUnreadCounnt(aum)).subscribe()

        this.http.post<{ list: { id: number, nickname: string, avatar: string }[] }>(`/user/get_user_list`, {
            u: idlist
        }).subscribe(s => {

            s.list.forEach(l => {
                let index = this.dialogList.findIndex(item => item.to == String(l.id));
                this.dialogList[index].avatar = l.avatar;
                this.dialogList[index].nickname = l.nickname;
            })

            // const _ = new AddSession(this.dialogList
            //     .map((session) => ({
            //         ...session,
            //         avatar: s.list.find(i => String(i.id) == session.to).avatar,
            //         nickname: s.list.find(i => String(i.id) == session.to).nickname
            //     }))
            // );
            // console.log(_)
            // this.store.dispatch(_).subscribe()
            this.store.dispatch(new AddSession(this.dialogList)).subscribe()

        })





        this.route.queryParams.subscribe(params => {
            if (params.id) {
                if (this.dialogList.map(l => { return l.to != params.id }).indexOf(false) == -1) {
                    let newdialog = { id: 'p2p-' + params.id, scene: 'p2p', to: params.id, nickname: params.nick, avatar: params.avatar, updateTime: 0, lastMsg: [], unread: 0 };
                    // this.dialogList?.unshift(newdialog);
                    // this.store.dispatch(new AddSession(this.dialogList)).subscribe(s => {

                    // })
                } else {
                    this.nim.getHistoryMsgs({
                        scene: 'p2p',
                        to: params.id,
                        limit: 20,
                        done: this.getHistoryMsgsDone.bind(this),
                    });
                    // this.scrollToBottom();
                }
                // this.nowavatar$.next(params.avatar);
                // this.nowuserid$.next(params.id);
                // this.nownickname$.next(params.nick);
                // this.cdr.markForCheck();

            }
        })

        //刷新
    }

    onUpdateSession(session: any) {
        console.log('会话更新了', session);
        this.sessions$.next(this.nim.mergeSessions(
            this.sessions$.value,
            session
        ));
        this.dialogList = this.sessions$.value;
        console.log(session.to);
        console.log(typeof session.to)
        if (this.dialogList.findIndex(item => item.to == session.to) == -1) {
            console.log(55555)
            this.http.post<{ list: { id: number, nickname: string, avatar: string }[] }>(`/user/get_user_list`, {
                u: [session.to]
            }).subscribe(s => {
                s.list.forEach(l => {
                    let index = this.dialogList.findIndex(item => item.to == String(l.id));
                    this.dialogList[index].avatar = l.avatar;
                    this.dialogList[index].nickname = l.nickname;
                })
                this.store.dispatch(new AddSession(this.dialogList)).subscribe()
            })
        }
        this.store.dispatch(new AddSession(this.dialogList)).subscribe()
        //    this.sessions$.value.forEach(l=>{
        // this.store.dispatch(new AddSession(this.dialogList)).subscribe(s => {
        //     console.log(s)
        // })
        //    })
        //刷新
    }




    onMsg(msg: any) {
        this.nottoButtom$.next(true);
        console.log('收到消息', msg.scene, msg.type, msg);


        this.pushMsg(msg);
        this.store.dispatch(new AddUnreadCounnt()).subscribe(s => {
            console.log(s)
        })
        // this.scrollToBottom();
    }
    onSyncDone() {
        console.log('同步完成');
    }

    sessionidd: any;
    msgs$ = new BehaviorSubject<any>({})
    pushMsg(msgs: IMMessage[] | IMMessage) {

        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        // var sessionId = msgs[0].sessionId;
        this.sessionidd = msgs[0]?.sessionId;
        this.msgs$.next(msgs || {});
        this.msgs$.value.sessionId = this.nim.mergeMsgs(
            this.dialogHistroy,
            msgs
        );

        this.dialogHistroy = (this.msgs$).value.sessionId;

        this.store.dispatch(new AddHistroy(this.dialogHistroy, this.sessionidd)).subscribe(s => {
            this.nottoButtom$.subscribe(is => {
                if (is) {
                    const timer = setInterval(() => {
                        if (this.box && this.dialogHistroy.length > 0) {
                            this.box.nativeElement.scrollTop = this.content.nativeElement.clientHeight;
                            clearInterval(timer);
                        }
                    }, 1);
                }
            })

        })

    }

    onSessionsWithMoreRoaming(error: any, msg: any) {
        console.log(
            '获取漫游' + (!error ? '成功' : '失败'),
            error,
            msg
        );

    }

    onroamingmsgs(obj: { msgs: any }) {
        console.log('漫游消息', obj);
        this.pushMsg(obj.msgs);
    }

    endTime$ = new BehaviorSubject(0);
    count$ = new BehaviorSubject(0)
    getHistoryMsgsDone(error: any, obj: { msgs: any }) {
        console.log(
            '获取云端历史记录' + (!error ? '成功' : '失败'),
            error,
            obj
        );
        if (!error) {
            this.pushMsg(obj.msgs);
        }
        this.endTime$.next(obj.msgs[19]?.time)
        this.count$.next(obj.msgs.length);
    }

    nottoButtom$ = new BehaviorSubject(true);
    scroll(hellobox: ElementRef, box: ElementRef, id: string) {
        this.nottoButtom$.next(false);
        combineLatest(
            this.endTime$,
            this.count$
        ).pipe(
            take(1),
            tap(([s, c]) => {
                if (c == 20) {
                    this.nim.getHistoryMsgs({
                        scene: 'p2p',
                        to: id,
                        limit: 20,
                        endTime: s,
                        done: this.getHistoryMsgsDone.bind(this),
                    });
                }
            })
        ).subscribe(s => {
            hellobox.nativeElement.scrollTop = hellobox.nativeElement.scrollHeight - box.nativeElement.clientHeight - 20;
        })
    }


    getMoreSession() {
        combineLatest(
            this.sessionCount$,
            this.sessionLastId$
        ).pipe(
            take(1),
            tap(([c, id]) => {
                if (c != 0) {
                    this.nim.getLocalSessions({
                        lastSessionId: id,
                        limit: 20,
                        done: this.getLocalSessionsDone.bind(this)
                    })
                }
            })
        )
    }

    send(text: HTMLTextAreaElement, id: string) {

        let un = this.dialogList.filter(item => { return item.to == id });

        this.nim.resetSessionUnread('p2p-' + id);
        if (un[0].unread) {
            this.store.dispatch(new ReduceUnreadCounnt(un[0].unread)).subscribe()
        }


        this.nottoButtom$.next(true);
        const msg = this.nim.sendText({
            scene: 'p2p',
            to: id,
            text: text.value,
            done: this.sendMsgDone.bind(this),
        });
        text.value = '';

        console.log('正在发送p2p text消息, id=' + msg.idClient);


    }


    sendMsgDone(error: any, msg: any) {

        console.log(
            '发送' +
            msg.scene +
            ' ' +
            msg.type +
            '消息' +
            (!error ? '成功' : '失败') +
            ', id=' +
            msg.idClient,
            error,
            msg
        );
        this.pushMsg(msg);
        // this.scrollToBottom();
    }


    select(id: string, unread: number) {

        this.nottoButtom$.next(true);
        this.dialogHistroy = [];
        this.count$.next(0);
        this.endTime$.next(0);
        this.nim.resetSessionUnread('p2p-' + id);
        this.store.dispatch(new ReduceUnreadCounnt(unread)).subscribe()
    }

    dis() {
        this.nim.logout();
        // this.dialogList=[];
        // this.dialogHistroy=[];
        this.sessions$.next([])
        this.store.dispatch(new RemoveSessionAll()).subscribe();
        this.store.dispatch(new ReplyUnreadCounnt(0)).subscribe()
        this.store.dispatch(new RemoveHistroyAll()).subscribe()
    }



}
