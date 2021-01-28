import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddHistroy,
  AddOneHistroy,
  AddSessionOne,
  AddUnreadCounnt,
  ReduceUnreadCounnt,
  ReplyUnreadCounnt,
} from '../state/chat.action';
import { take, takeWhile } from 'rxjs/operators';
import { ModalService } from './modals.service';
import { UserState } from '../state/user.state';
import { PopTips } from '../../components/pop-tips/pop-tips';

type RoomList = {
  list: {
    message: {
      content: string;
      type: number;
      speaktime: number;
    };
    unread: number;
    roomid: string;
    sender_id: number;
    sender_avatar: string;
    sender_nickname: string;
  }[];
};

@Injectable()
export class ChatStartService {
  @Select(UserState.id)
  userid$: Observable<number>;

  // 获取历史记录的时间戳
  lastTime$ = new BehaviorSubject(new Date().getTime());
  // 单次获取到的历史记录消息数量（用于判断是否还有历史消息可获取）
  count$ = new BehaviorSubject(0);
  // 第一次获取聊天室的时间戳
  compareDay$ = new BehaviorSubject(new Date().getTime());
  // 历史消息列表
  histroy: any = [];
  // 未读数总数
  totalUnread$ = new BehaviorSubject(0);
  // 聊天室id数组
  roomidList = [];
  // 历史消息列表是否置底
  isButtom$ = new BehaviorSubject(false);

  connectAgain$ = new BehaviorSubject(0);

  // 会话列表
  roomList: {
    message: {
      content: string;
      type: number;
      speaktime: number;
    };
    unread: number;
    roomid: string;
    sender_id: number;
    sender_avatar: string;
    sender_nickname: string;
  }[] = [];

  // 是否显示消息时间，用于sendMessage()
  showTime$ = new BehaviorSubject(true);

  ws: WebSocket;

  historyBatches$ = new BehaviorSubject([]);
  list$ = new BehaviorSubject([]);

  noMoreHistroy$ = new BehaviorSubject(false);

  clearTimer: any;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router,
    private modal: ModalService
  ) {}

  /**
   * 后端获取url
   */
  getWebsocketUrl(): void {
    this.http.post<{ server: string }>('/chat/connect', {}).subscribe((s) => {
      this.connect(s.server);
    });
  }

  private blob2ArrayBuffer = async (blob: Blob) => {
    const reader = new FileReader();
    return new Promise<ArrayBuffer>((res) => {
      reader.onload = () => {
        res(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  /**
   * websocket连接
   */
  connect(url: string): void {
    this.ws = new WebSocket(url);
    this.http
      .get<{ roomid: string; count: number }[]>('/chat/unread_count')
      .subscribe((s) => {
        let num = 0;
        s.forEach((l) => {
          num = num + l.count;
        });
        this.store.dispatch(new ReplyUnreadCounnt(num)).subscribe();
      });

    // 接受消息
    this.ws.onmessage = async (msg) => {
      const buffer = await this.blob2ArrayBuffer(msg.data as Blob);
      const view = new DataView(buffer);
      // 消息类型
      const messageType = view.getUint8(0);
      // 私信对象id
      const senderId = view.getInt32(1, true);
      // 房间id
      const roomid = view.getBigInt64(5, true).toString();
      // 消息内容
      let msgcontent: string;
      // 存在消息时
      if (buffer.byteLength > 13) {
        msgcontent = ab2str(buffer.slice(13));
      }

      const i = this.roomList.findIndex((item) => item.sender_id === senderId);

      if (messageType == 5) {
        // ping
        this.ws.send('');
        return;
      } else {
        if (i == -1) {
          // 第一次收到对方消息

          this.roomidList.push(roomid);

          this.http
            .post<{ list: { id: number; nickname: string; avatar: string }[] }>(
              `/user/get_user_list`,
              {
                u: [senderId],
              }
            )
            .subscribe((s) => {
              s.list.forEach((l) => {
                this.roomList?.unshift({
                  message: {
                    content: msgcontent,
                    type: messageType,
                    speaktime: new Date().getTime(),
                  },
                  roomid,
                  sender_id: senderId,
                  sender_avatar: l.avatar,
                  sender_nickname: l.nickname,
                  unread: 1,
                });
              });
            });
          this.store.dispatch(new AddUnreadCounnt()).pipe(take(1)).subscribe();
        } else {
          const count = this.roomList[i].unread ?? 0;

          // 双方正在沟通中
          this.route.queryParams.pipe(take(1)).subscribe((p) => {
            if (String(p.r) == roomid) {
              this.roomList[i] = {
                ...this.roomList[i],
                message: {
                  content: msgcontent,
                  type: messageType,
                  speaktime: new Date().getTime(),
                },
                unread: null,
              };
              this.store
                .dispatch(
                  new AddOneHistroy([
                    {
                      message: msgcontent,
                      speaktime: new Date().getTime(),
                      sender_id: senderId,
                      type: messageType,
                    },
                  ])
                )
                .subscribe();
              this.alreadyRead([roomid]);
            } else {
              this.roomList[i] = {
                ...this.roomList[i],
                message: {
                  content: msgcontent,
                  type: messageType,
                  speaktime: new Date().getTime(),
                },
                unread: count + 1,
              };
              this.store
                .dispatch(new AddUnreadCounnt())
                .pipe(take(1))
                .subscribe();
            }
          });
          this.isButtom$.next(true);
        }

        // this.store.dispatch(new AddSession(this.roomList)).subscribe();
        this.list$.next(this.roomList);
      }
    };
    // websocket连接失败
    this.ws.onerror = (err) => {
      console.log(err);

      interval(5000)
        .pipe(
          take(1),
          takeWhile(() => this.connectAgain$.value <= 2)
        )
        .subscribe((s) => {
          this.getWebsocketUrl();
          this.connectAgain$.next(this.connectAgain$.value + 1);
        });
    };
  }

  /**断开websocket */

  disconnectWs(): void {
    this.ws.close();
  }

  /**
   * 获取历史消息
   * first:判断是否为第一次获取该聊天室的历史记录
   */
  getHistroy(r: string, first?: number): void {
    this.isButtom$.next(false);
    if (first) {
      this.lastTime$.next(new Date().getTime());
      this.count$.next(20);
      this.histroy = [];
      this.noMoreHistroy$.next(false);
    }
    if (!this.noMoreHistroy$.value) {
      this.count$.pipe(take(1)).subscribe((count) => {
        if (count == 20) {
          this.count$.next(0);

          this.http
            .post<
              {
                message: string;
                speaktime: number;
                sender_id: number;
                type: number;
                showtime: boolean;
              }[]
            >(`/chat/history`, {
              r,
              l: Number(this.lastTime$.value),
            })
            .subscribe((s) => {
              if (s) {
                s.forEach((l) => {
                  selectShowTime(l, this.compareDay$);
                });
                if (
                  this.histroy.findIndex(
                    (l: { speaktime: number }) =>
                      l.speaktime === s[0]?.speaktime
                  ) === -1
                ) {
                  let tem = [];
                  tem = s.reverse();
                  this.histroy = tem.concat(this.histroy);
                  this.count$.next(s.length);
                  if (s.length < 20) {
                    this.noMoreHistroy$.next(true);
                  }
                  this.lastTime$.next(tem[0]?.speaktime);
                  this.historyBatches$.next(tem);
                  this.store
                    .dispatch(new AddHistroy(this.histroy))
                    .subscribe((_) => {
                      if (first) {
                        this.isButtom$.next(true);
                      }
                    });
                }
              }
            });
        }
      });
    }
  }

  /**
   * timerBox()  5分钟后发送消息则显示消息时间
   */

  timerBox(): void {
    this.clearTimer = setTimeout(() => {
      this.showTime$.next(true);
    }, 300000);
  }

  /**
   * 发送消息
   */
  sendMessage(
    id: number,
    value: string,
    type: number,
    me: number,
    url?: string
  ): void {
    this.http
      .post<{ message: { content: string; type: number } }>(
        '/chat/send_message',
        {
          r: id,
          m: value,
          t: type,
        }
      )
      .subscribe(
        (s) => {
          // 发送后通知后端已读
          this.http
            .post('/chat/read', {
              r: [Number(id)],
            })
            .subscribe();

          const i = this.roomList.findIndex(
            (item) => Number(item.roomid) == id
          );
          const ava = this.roomList[i].sender_avatar;
          const nick = this.roomList[i].sender_nickname;
          const uid = this.roomList[i].sender_id;
          this.roomList = this.roomList.filter((_, index) => i !== index);
          this.roomList.unshift({
            message: { content: value, type, speaktime: new Date().getTime() },
            roomid: String(id),
            sender_id: uid,
            sender_avatar: ava,
            sender_nickname: nick,
            unread: 0,
          });
          // this.store.dispatch(new AddSession(this.roomList)).subscribe();
          this.list$.next(this.roomList);

          if (url) {
            // 发送图片
            this.store
              .dispatch(
                new AddOneHistroy({
                  message: url,
                  speaktime: new Date().getTime(),
                  sender_id: me,
                  type,
                  showtime: this.showTime$.value,
                })
              )
              .subscribe((_) => {
                this.isButtom$.next(true);
                this.showTime$.next(false);
                clearTimeout(this.clearTimer);
                this.timerBox();
              });
          } else {
            // 发送文字

            this.store
              .dispatch(
                new AddOneHistroy({
                  message: value,
                  speaktime: new Date().getTime(),
                  sender_id: me,
                  type: 0,
                  showtime: this.showTime$.value,
                })
              )
              .subscribe((_) => {
                this.isButtom$.next(true);
                this.showTime$.next(false);
                clearTimeout(this.clearTimer);
                this.timerBox();
              });
          }
        },
        (e) => {
          if (e.code === 701) {
            this.modal.open(PopTips, ['对方已将你拉黑', false]);
          }
        }
      );
  }

  /**
   * 创建新的聊天室
   */
  openNewRoom(id: number, me: number, nick: string, ava: string): void {
    this.http
      .post<{ roomid: number; userid: number }>('/chat/open_room', {
        u: id,
      })
      .subscribe((s) => {
        this.router.navigate(['/message/chat'], {
          queryParams: {
            i: id,
            n: nick,
            a: ava,
            r: s.roomid,
          },
        });
        this.store.dispatch(
          new AddSessionOne({
            message: { content: '', type: 0, speaktime: 0 },
            roomid: s.roomid,
            sender_id: me,
            sender_avatar: ava,
            sender_nickname: nick,
          })
        );
      });
  }

  /**
   * 关闭聊天室
   */
  closeRoom(id: string): void {
    const i = this.roomList.findIndex((l) => l.roomid === id);
    this.store
      .dispatch(new ReduceUnreadCounnt(this.roomList[i].unread))
      .subscribe();
    this.roomList.splice(i, 1);
    this.list$.next(this.roomList);
  }

  /**
   * 已读
   */
  alreadyRead(id: Array<string>): void {
    this.http
      .post('/chat/read', {
        r: id,
      })
      .subscribe((_) => {
        id.forEach((a) => {
          const i = this.roomList.findIndex((item) => item.roomid == a);
          if (this.roomList[i]?.unread) {
            this.store
              .dispatch(new ReduceUnreadCounnt(Number(this.roomList[i].unread)))
              .subscribe((s) => {
                this.roomList[i] = { ...this.roomList[i], unread: null };
              });
          }
        });
        // this.store.dispatch(new AddSession(this.roomList)).subscribe();
        this.list$.next(this.roomList);
      });
  }

  /**
   * 离开私聊重置totalUnread$
   */

  changeTotalUnread(): void {
    this.totalUnread$.next(0);
  }

  /**
   * chat.page.ts 控制是否置底
   */

  changeIsButtom(f: boolean): void {
    this.isButtom$.next(f);
  }

  /**
   * 获取消息列表
   */
  getList(): void {
    this.http
      .get<RoomList>(`/chat/room_list?r=${this.roomidList}&s=20`)
      .subscribe((s) => {
        this.roomList = s.list;

        // roomlist按最近一条消息时间降序排序
        this.roomList.sort(compare('message'));

        const idlist = [];
        s.list.forEach((l) => {
          idlist.push(l.sender_id);
          this.roomidList.push(l.roomid);
        });
        console.log(this.roomidList);

        /**
         * 获取未读数
         */
        this.http
          .get<{ roomid: string; count: number }[]>('/chat/unread_count')
          .subscribe((a) => {
            a.forEach((l) => {
              const i = this.roomList.findIndex(
                (item) => item.roomid == l.roomid
              );
              this.roomList[i] = {
                ...this.roomList[i],
                unread: l.count,
              };
              this.totalUnread$.next(this.totalUnread$.value + l?.count);
            });

            this.store
              .dispatch(new ReplyUnreadCounnt(this.totalUnread$.value))
              .subscribe();
          });

        /**
         * 获取会话列表的个人的头像、昵称
         */
        this.http
          .post<{ list: { id: number; nickname: string; avatar: string }[] }>(
            `/user/get_user_list`,
            {
              u: idlist,
            }
          )
          .subscribe((v) => {
            v.list.forEach((l) => {
              const index = this.roomList.findIndex(
                (item) => item.sender_id == l.id
              );
              this.roomList[index].sender_avatar = l.avatar;
              this.roomList[index].sender_nickname = l.nickname;
            });
            // this.store.dispatch(new AddSession(this.roomList)).subscribe()
            this.list$.next(this.roomList);
          });
      });
  }
}

function compare(property: string): any {
  return function (
    a: { message: { speaktime: any } },
    b: { message: { speaktime: any } }
  ): any {
    const value1 = a?.message?.speaktime;
    const value2 = b?.message?.speaktime;
    return value2 - value1;
  };
}

/**
 * 该方法来判断历史消息单条消息是否显示消息时间（理论上以10分钟为一个界限）
 * @param l 单条消息
 * @param dayCompare$ 上条消息发送时间
 */
function selectShowTime(
  l: {
    sender_id: number;
    speaktime: number;
    message: string;
    type: number;
    showtime: boolean;
  },
  dayCompare$: BehaviorSubject<number>
): any {
  if (
    new Date(Number(dayCompare$.value)).getDate() ==
    new Date(Number(l.speaktime)).getDate()
  ) {
    const hour = Math.abs(
      new Date(Number(dayCompare$.value)).getHours() -
        new Date(Number(l.speaktime)).getHours()
    );
    const minutes = Math.abs(
      new Date(Number(dayCompare$.value)).getMinutes() -
        new Date(Number(l.speaktime)).getMinutes()
    );
    if (hour == 0) {
      if (minutes > 10) {
        l.showtime = true;
        dayCompare$.next(Number(l.speaktime));
      }
    } else {
      l.showtime = true;
      dayCompare$.next(Number(l.speaktime));
    }
  } else {
    l.showtime = true;
    dayCompare$.next(Number(l.speaktime));
  }
}

function ab2str(buffer: ArrayBuffer): any {
  const utf8decoder = new TextDecoder();
  return utf8decoder.decode(buffer);
}
