import {
  Component,
  ViewChild,
  Input,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  HostListener,
  AfterContentInit,
  AfterViewInit,
  AfterContentChecked,
} from '@angular/core';
import { BehaviorSubject, combineLatest, empty, Observable } from 'rxjs';
import { switchMap, take, shareReplay, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ModelComment, ModelSubComment } from '../model';
import { FormControl } from '@angular/forms';
import { Select } from '@ngxs/store';
import { ActivatedRoute, Router } from '@angular/router';
import { UserState, Toast } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { DropDownService } from 'libs/peacha-core/src/lib/core/service/dropdown.service';
import { ModalService } from 'libs/peacha-core/src/lib/core/service/modals.service';
import { CommentReportModalComponent } from 'libs/peacha-core/src/lib/components/comment-report-modal/comment-report-modal-component';

@Component({
  selector: 'ivo-comment-entry',
  templateUrl: './comment-entry.component.html',
  styleUrls: ['./comment-entry.component.less'],
  inputs: ['comment', 'aid'],
})
export class CommentEntryComponent {
  @ViewChild('hello') el: HTMLDivElement;
  @ViewChild('textbox') box: ElementRef;
  @ViewChild('dot') dot: ElementRef;
  @ViewChild('menuTemp') tmp: TemplateRef<any>;

  @Select(UserState.id)
  id$: Observable<number>;

  @Select(UserState.basicInfo)
  basicInfo$: Observable<{
    nickname: string;
    avatar: string;
    id: number;
    num_followed: number;
    num_following: number;
    banner: string;
  }>;

  set comment(c: ModelComment) {
    this.comment$.next(c);
    this.list = this.comment$.value;
    this.cid = c.id;
    this.route.queryParams.subscribe((s) => {
      if (s) {
        this.subcompage = Number(s.sub);
        this.rootid = Number(s.rootid);
        if ((this.subcompage + 1) / 10 > 1) {
          this.page$.next(Math.ceil((this.subcompage + 1) / 10));
        } else {
          this.page$.next(1);
        }
        if (this.cid == this.rootid) {
          this.show_all_reply$.next(true);
        }
      }
    });
  }

  showLoad: boolean = true;
  list: ModelComment | undefined;
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private modal: ModalService,
    private route: ActivatedRoute,
    private menu: DropDownService,
    private vc: ViewContainerRef,
    private router: Router,
    private toast: Toast
  ) {}
  rootid: number = -1;
  subcompage: number = -1;
  @Input() active: boolean = false;

  @Output() clickActive: EventEmitter<number> = new EventEmitter();

  page$ = new BehaviorSubject(1);
  comment$ = new BehaviorSubject<ModelComment | undefined>(undefined);
  show_all_reply$ = new BehaviorSubject(false);
  private cid: number;
  aid: number;
  current_replying$ = new BehaviorSubject<ModelSubComment | undefined>(
    undefined
  );
  subList: { count: number; list: ModelSubComment[] };

  ngAfterContentInit() {
    this.route.queryParams.subscribe((s) => {
      if (s.sub == -1) {
        let hash = location.hash;
        location.hash = '';
        location.hash = hash;
      }
    });
  }
  comments$ = this.page$.pipe(
    switchMap((p) => {
      return this.http
        .get<{
          count: number;
          list: ModelSubComment[];
        }>(`/comment/get_comment_sub?c=${this.cid}&p=${p - 1}&s=10`)
        .pipe(
          tap((s) => {
            this.showLoad = false;
            this.subList = s;
          })
        );
    })
  );

  replyControl: FormControl = new FormControl('');

  showAllReply() {
    this.show_all_reply$.next(true);
    this.page$.next(1);
  }

  tips(el: HTMLTextAreaElement, input: ElementRef) {
    const a = el.getBoundingClientRect();
    this.replyControl.valueChanges.subscribe((s) => {
      if (s.length > 200) {
        this.toast.show('最多只能发200字的评论', {
          type: 'error',
          el: input,
          timeout: 1000,
        });
      }
    });
  }
  like(id: number) {
    this.http
      .post('/comment/like', {
        c: id,
      })
      .subscribe((_) => {
        if (this.list?.id == id) {
          if (this.list.is_like == 1) {
            this.list.is_like = 0;
            this.list.like_count--;
          } else {
            this.list.is_like = 1;
            this.list.like_count++;
          }
        }
        this.cdr.markForCheck();
      });
  }

  one: ModelSubComment;

  a: number;
  b: string;
  reply(
    userid: number,
    usernick: string,
    el: HTMLTextAreaElement,
    input: ElementRef
  ) {
    const a = el.getBoundingClientRect();
    this.current_replying$
      .pipe(
        take(1),
        switchMap((v) => {
          if (v) {
            this.a = v.id;
            this.b = '回复 @' + v.nickname + ' ' + this.replyControl.value;
          } else {
            this.a = this.cid;
            this.b = this.replyControl.value;
          }
          if (this.replyControl.value) {
            return this.http
              .post<{ id: number }>('/comment/comment_sub', {
                c: this.b,
                r: this.a,
              })
              .pipe(
                tap((s) => {
                  this.basicInfo$.subscribe((info) => {
                    if (v) {
                      this.one = {
                        id: s.id,
                        userid: info.id,
                        nickname: info.nickname,
                        avatar: info.avatar,
                        content:
                          '回复 @' + v.nickname + ' ' + this.replyControl.value,
                        comment_time: Date.now(),
                        like_count: 0,
                        is_like: 0,
                        replied_user_id: userid,
                        replied_user_name: usernick,
                      };
                    } else {
                      this.one = {
                        id: s.id,
                        userid: info.id,
                        nickname: info.nickname,
                        avatar: info.avatar,
                        content: this.replyControl.value,
                        comment_time: Date.now(),
                        like_count: 0,
                        is_like: 0,
                        replied_user_id: 0,
                        replied_user_name: '',
                      };
                    }
                  });
                  this.show_all_reply$.subscribe((s) => {
                    if (s) {
                      this.subList?.list?.unshift(this.one);
                    } else {
                      this.list?.comment_list.unshift(this.one);
                    }
                  });

                  // if (this.comment$.value) {
                  //   this.comment$.value.comment_count++;
                  // }
                  // if (this.list?.comment_list.length == 4) {
                  //   this.list?.comment_list.pop()
                  // }
                  this.replyControl.setValue('');
                  this.cdr.markForCheck();
                }),
                catchError((e) => {
                  if (Math.abs(e.code) == 122) {
                    this.toast.show('重复评论', {
                      type: 'error',
                      el: input,
                      timeout: 1000,
                    });
                  }

                  return empty();
                })
              );
          } else {
            this.toast.show('不能发送空评论', {
              type: 'error',
              el: input,
              timeout: 1000,
            });
          }
        })
      )
      .subscribe(
        (s) => {},
        (e) => {}
      );
  }
  toUser(id: number) {
    this.router.navigate(['user', id]);
    document.documentElement.scrollTop = 0;
  }
  toggleReply(c?: ModelSubComment) {
    if (c == undefined) {
      this.active = true;
      this.clickActive.emit(this.cid);
      this.box.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else {
      this.current_replying$.next(c);
      this.active = true;
      this.box.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  subLength: number;

  toLogin() {
    let a =
      (this.route.snapshot as any)._routerState.url.split('/')[1] +
      '/' +
      (this.route.snapshot as any)._routerState.url.split('/')[2];
    this.router.navigate(['/login'], {
      queryParams: {
        return: a,
      },
    });
  }

  toPage(p: number) {
    this.page$.next(p);
    this.cdr.markForCheck();
  }

  delete(id: number) {
    this.modal
      .open(PopTips, ['确定要删除该评论吗？', true])
      .afterClosed()
      .subscribe((s) => {
        if (s) {
          this.http
            .post('/comment/delete', {
              c: id,
            })
            .subscribe((_) => {
              this.cdr.markForCheck();
              this.comment$.next(undefined);
              this.cdr.detectChanges();
            });
        }
      });
  }

  open() {
    this.menu.menu(this.dot, this.tmp, this.vc, 0, 10);
  }
  report(id: number) {
    this.modal.open(CommentReportModalComponent, id);
  }
}
