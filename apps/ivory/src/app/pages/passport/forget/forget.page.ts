import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import {
  combineLatest,
  empty,
  interval,
  BehaviorSubject,
  Subscription,
  Observable,
} from 'rxjs';
import { take, switchMap, tap, catchError } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { Toast, ModalService, UserState, IvoryError } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { Steps } from 'libs/peacha-core/src/lib/components/steps/steps';
import { Logout } from 'libs/peacha-core/src/lib/core/state/user.action';

@Component({
  selector: 'ivo-forget',
  templateUrl: './forget.page.html',
  styleUrls: ['./forget.page.less'],
})
export class ForgetPage {
  titleShow: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
    private route: ActivatedRoute,
    private modal: ModalService,
    private store: Store
  ) {
    this.account = new FormControl('', [Validators.required]);
    this.verifyCode = new FormControl('', [Validators.required]);
    this.password = new FormControl('', [
      Validators.minLength(8),
      Validators.maxLength(16),
      Validators.pattern('^(?=.*[a-zA-Zd])[!-~]{8,16}$'),
    ]);
    this.passwordConfirm = new FormControl('', [this.confirmValidator]);

    this.route.queryParams.subscribe((i) => {
      if (i.type) {
        this.titleShow = true;
      } else {
        this.titleShow = false;
      }
    });
  }

  @ViewChild(Steps) steps: Steps;

  @Select(UserState.isLogin)
  isLogin$: Observable<boolean>;

  account = new FormControl('');
  verifyCode = new FormControl('');
  password = new FormControl('');
  passwordConfirm = new FormControl('');
  enum = {
    phone: 0,
    email: 1,
  };
  account$ = new BehaviorSubject<string>('');

  token: string;

  cooldown$ = new BehaviorSubject<number>(0);
  requesting$ = new BehaviorSubject<boolean>(false);
  sp?: Subscription;
  confirmAccount(el: HTMLInputElement) {
    if ((this.account.value as string).indexOf('@') == -1) {
      this.account$.next(this.account.value + ',86');
    } else {
      this.account$.next(this.account.value);
    }
    this.request(el);
  }

  confirmVerify() {
    this.http
      .post<{
        token: string;
      }>('/common/get_verify_token', {
        t: this.account$.value,
        p: 1,
        v: this.verifyCode.value,
      })
      .subscribe(
        (s) => {
          this.token = s.token;
          this.steps.next();
        },
        (e) => {
          //console.log(e);
          this.verifyCode.setErrors({
            wrong_code: true,
          });
          this.cdr.markForCheck();
        }
      );
  }
  finishReset() {
    this.http
      .post('/user/set_new_password', {
        t: this.token,
        n: this.passwordConfirm.value,
      })
      .subscribe(
        (s) => {
          this.modal
            .open(PopTips, ['您已成功修改密码', false, 1])
            .afterClosed()
            .subscribe((s) => {
              if (s) {
                this.router.navigate(['/login']);
                this.store.dispatch(new Logout()).subscribe();
              }
            });
          // this.steps.next();
        },
        (e) => {
          //console.log(e);
        }
      );
  }
  skip() {
    this.router.navigate(['/login'], { queryParamsHandling: 'preserve' });
  }

  // 确认密码验证
  confirmValidator = (
    passwordConfirm: FormControl
  ): { [s: string]: boolean } => {
    if (!passwordConfirm.value) {
      return { error: true, required: true };
    } else if (passwordConfirm.value !== this.password.value) {
      return { confirm: true, error: true };
    } else {
      return {};
    }
  };
  request(el: HTMLInputElement) {
    const a = el.getBoundingClientRect();
    this.sp = combineLatest(this.account$, this.cooldown$, this.requesting$)
      .pipe(
        take(1),
        switchMap(([account, cooldown, requesting]) => {
          if (cooldown > 0 || requesting) {
            return empty();
          }
          this.requesting$.next(true);
          return this.http
            .post('/common/request_verify_code', {
              t: account,
              p: 1,
            })
            .pipe(
              tap(
                (s) => {
                  this.steps.next();
                  this.requesting$.next(false);
                },
                (e) => {
                  this.requesting$.next(false);
                },
                () => {}
              ),
              switchMap((_) => {
                this.cooldown$.next(60);
                return interval(1000).pipe(
                  take(60),
                  tap(
                    (v) => {
                      this.cooldown$.next(59 - v);
                    },
                    (e) => {},
                    () => {}
                  )
                );
              }),
              catchError((s: IvoryError) => {
                if (s.code == 101) {
                  this.toast.show('用户不存在', {
                    type: 'error',
                    origin: {
                      clientX: a.left,
                      clientY: a.bottom,
                    },
                    timeout: 1000,
                  });
                }
                return empty();
              })
            );
        }),
        tap(
          (f) => {},
          null,
          () => {}
        )
      )
      .subscribe(
        (b) => {},
        null,
        () => {
          // 销毁时回收...
          //console.log('aaaaaa');
        }
      );
  }
  requestAgain() {
    this.sp = combineLatest(this.account$, this.cooldown$, this.requesting$)
      .pipe(
        take(1),
        switchMap(([account, cooldown, requesting]) => {
          if (cooldown > 0 || requesting) {
            return empty();
          }
          this.requesting$.next(true);
          return this.http
            .post('/common/request_verify_code', {
              t: account,
              p: 1,
            })
            .pipe(
              tap(
                (s) => {
                  this.requesting$.next(false);
                },
                (e) => {
                  this.requesting$.next(false);
                },
                () => {}
              ),
              switchMap((_) => {
                this.cooldown$.next(60);
                return interval(1000).pipe(
                  take(60),
                  tap(
                    (v) => {
                      this.cooldown$.next(59 - v);
                    },
                    (e) => {},
                    () => {}
                  )
                );
              })
            );
        }),
        tap(
          (f) => {},
          null,
          () => {}
        )
      )
      .subscribe(
        (b) => {},
        null,
        () => {
          // 销毁时回收...
          //console.log('aaaaaa');
        }
      );
  }

  ngOnDestroy() {
    this.toast.close();
  }
}
