import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState, ModalService, ZoomService, Toast } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { Observable, BehaviorSubject, Subject, timer, EMPTY } from 'rxjs';
import { switchMap, tap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { IllustZoomModalComponent } from '../../work/illust-zoom-modal/illust-zoom-modal.component';

@Component({
  selector: 'ivo-customer-service',
  templateUrl: './customer-service.page.html',
  styleUrls: ['./customer-service.page.less'],
})
export class CustomerServicePage implements OnDestroy {
  @Input()
  file: File;

  @ViewChild('hellobox') hellobox: ElementRef;
  @ViewChild('box') box: ElementRef;
  @ViewChild('input') input: ElementRef;
  @ViewChild('text') area: ElementRef;

  @Select(UserState.avatar)
  useravatar$: Observable<string>;

  @Select(UserState.id)
  id$: Observable<number>;

  histroy: any = [];

  now = new Date().getTime();
  lastTime$ = new BehaviorSubject(this.now);
  count$ = new BehaviorSubject(0);
  showTime$ = new BehaviorSubject(true);
  page$ = new BehaviorSubject(0);

  destroy$ = new Subject<void>();

  compareDay$ = new BehaviorSubject(new Date().getTime());

  clearTimer: any;

  isShow = true;

  id: number;
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private modal: ModalService,
    private zoom: ZoomService,
    private toast: Toast,
    private scrollDispatcher: ScrollDispatcher
  ) {
    this.id$.subscribe((s) => {
      this.id = s;
      if (s > 0) {
        timer(1000, 10000)
          .pipe(
            switchMap((t) => {
              return this.http.get<{
                list: {
                  sender_id: number;
                  sender_avatar: string;
                  speaktime: number;
                  message: string;
                  type: number;
                  readstate: number;
                }[];
              }>('/webim/unread');
            }),
            tap((l) => {
              l.list.forEach((x) => {
                this.histroy = this.histroy.concat(x);
                this.scrollToBottom();
                this.cdr.markForCheck();
              });
            }),
            takeUntil(this.destroy$)
          )
          .subscribe();
      }
    });
  }

  getHistroy$ = this.page$
    .pipe(
      withLatestFrom(this.count$),
      switchMap(([p, c]) => {
        if (c === 20 || p === 0) {
          return this.http
            .post<{
              list: {
                sender_id: number;
                sender_avatar: string;
                speaktime: number;
                message: string;
                type: number;
                readstate: number;
                showtime: boolean;
              }[];
            }>(`/webim/history`, {
              l: this.lastTime$.value,
            })
            .pipe(
              tap((s) => {
                const tempArr = [];

                this.count$.next(s.list.length);

                s.list.forEach((l) => {
                  select(l, this.compareDay$);
                  tempArr.push(l);
                });
                this.histroy = tempArr.concat(this.histroy);
                this.lastTime$.next(s.list[0]?.speaktime);
                if (p === 0) {
                  this.scrollToBottom();
                } else {
                  this.hellobox.nativeElement.scrollTop =
                    this.hellobox.nativeElement.scrollHeight -
                    this.box.nativeElement.clientHeight;
                }
                this.cdr.detectChanges();
              })
            );
        } else {
          return EMPTY;
        }
      })
    )
    .subscribe();

  scroll$ = this.scrollDispatcher
    .scrolled()
    .pipe(
      tap((scrollable) => {
        if (scrollable) {
          const scroll = scrollable as CdkScrollable;
          if (scroll.measureScrollOffset('top') <= 0) {
            if (this.count$.value === 20) {
              this.page$.next(this.page$.value + 1);
            }
          }
        }
      })
    )
    .subscribe();

  scrollToBottom = () => {
    const time = setInterval(() => {
      if (this.hellobox && this.histroy.length > 0) {
        this.hellobox.nativeElement.scrollTop =
          this.box.nativeElement.clientHeight + 9000;
        clearInterval(time);
      }
    }, 1);
  };

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.file) {
      this.sendPic(event.dataTransfer.files[0]);
    }
  }

  trackByIndex(index, item): void {
    return index;
  }
  timerBox(): void {
    this.clearTimer = setTimeout(() => {
      this.showTime$.next(true);
    }, 300000);
  }

  showDetail(data: string): void {
    this.zoom.open(IllustZoomModalComponent, {
      assets: [data],
      index: 0,
    });
  }

  contentChange(p: number, text: string): void {}

  sendPic(event: any): void {
    if (event.type.split('image').length > 1) {
      const form = new FormData();
      form.append('f', event);
      this.http
        .post<{ token: string; url: string }>('/common/upload_file', form)
        .subscribe((s) => {
          this.http
            .post<{
              list: {
                sender_id: number;
                sender_avatar: string;
                speaktime: string;
                message: string;
                type: number;
                readstate: number;
                showtime: boolean;
              }[];
            }>('/webim/send_message', {
              m: s.token,
              t: 1,
            })
            .subscribe((t) => {
              if (t.list) {
                this.histroy = this.histroy.concat(t.list);
                this.scrollToBottom();
                this.cdr.detectChanges();
              }

              this.useravatar$.subscribe((a) => {
                this.histroy.push({
                  sender_id: this.id,
                  sender_avatar: a,
                  speaktime: new Date(),
                  message: s.url,
                  type: 1,
                  readstate: 1,
                  showtime: this.showTime$.value,
                });
                this.input.nativeElement.value = null;
                this.scrollToBottom();
                this.cdr.detectChanges();
              });

              this.showTime$.next(false);
              clearTimeout(this.clearTimer);
              this.timerBox();
            });
        });
    } else {
      this.modal.open(PopTips, ['目前只支持发送文字和图片', false]);
    }
  }

  sendMsg(text: HTMLTextAreaElement, el: ElementRef, e?: any): void {
    e?.preventDefault();
    if (text.value.trim()) {
      this.http
        .post<{
          list: {
            sender_id: number;
            sender_avatar: string;
            speaktime: number;
            message: string;
            type: number;
            readstate: number;
            showtime: boolean;
          }[];
        }>('/webim/send_message', {
          m: text.value,
          t: 0,
        })
        .subscribe((s) => {
          if (s.list) {
            this.histroy = this.histroy.concat(s.list);
            this.scrollToBottom();
            this.cdr.detectChanges();
          }
          this.useravatar$.subscribe((a) => {
            this.histroy.push({
              sender_id: this.id,
              sender_avatar: a,
              speaktime: new Date(),
              message: text.value,
              type: 0,
              readstate: 1,
              showtime: this.showTime$.value,
            });
            this.scrollToBottom();
            this.cdr.detectChanges();
            text.value = null;
          });

          this.showTime$.next(false);
          this.timerBox();
        });
    } else {
      this.toast.show('发送内容不能为空', {
        type: 'error',
        el,
        timeout: 1000,
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.scroll$.unsubscribe();
  }
}

function select(
  l: {
    sender_id: number;
    sender_avatar: string;
    speaktime: number;
    message: string;
    type: number;
    readstate: number;
    showtime: boolean;
  },
  dayCompare$: BehaviorSubject<number>
): void {
  if (
    new Date(dayCompare$.value).getDate() == new Date(l.speaktime).getDate()
  ) {
    const hour = Math.abs(
      new Date(dayCompare$.value).getHours() - new Date(l.speaktime).getHours()
    );
    const minutes = Math.abs(
      new Date(dayCompare$.value).getMinutes() -
        new Date(l.speaktime).getMinutes()
    );
    if (hour == 0) {
      if (minutes > 10) {
        l.showtime = true;
        dayCompare$.next(l.speaktime);
      }
    } else {
      l.showtime = true;
      dayCompare$.next(l.speaktime);
    }
  } else {
    l.showtime = true;
    dayCompare$.next(l.speaktime);
  }
}
