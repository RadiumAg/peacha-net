import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, interval, Subject } from 'rxjs';
import {
  switchMap,
  tap,
  takeUntil,
  takeWhile,
  take,
  delay,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { OnDestroy } from '@angular/core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { Steps } from 'libs/peacha-core/src/lib/components/steps/steps';
import { ModalService } from 'libs/peacha-core/src/lib/core/service/modals.service';

@Component({
  selector: 'ivo-wallet-detail',
  templateUrl: './wallet-pay.page.html',
  styleUrls: ['./wallet-pay.page.less'],
})
export class WalletPayPage implements OnInit, OnDestroy {
  constructor(
    private http: HttpClient,
    private modal: ModalService,
    private el: ElementRef,
    private router: Router
  ) {}
  @ViewChild(Steps) steps: Steps;
  money: FormControl = new FormControl();
  money$ = new BehaviorSubject<number>(0);
  way$ = new BehaviorSubject<number>(1);
  error = false;
  error$ = new BehaviorSubject<number>(0);

  destory$ = new Subject<void>();
  qrcode$ = new BehaviorSubject<string>('');
  cashier_id$ = new BehaviorSubject<number>(0);

  ngOnInit(): void {}
  sum() {
    this.error$.next(1);
    this.error = true;

    if (this.money$.value < 2 || !this.money$.value) {
    } else if (this.way$.value === 0) {
    } else {
      this.http
        .post<{ cashier_id: string; qrcode: string }>(
          '/wallet/cashier/recharge',
          {
            amount: this.money$.value,
            channel: this.way$.value,
          }
        )
        .subscribe(
          (s) => {
            console.log(s.qrcode);
            const div = document.createElement('divform');
            div.innerHTML = s.qrcode;
            document.body.appendChild(div);

            document.forms[0].setAttribute('target', '_blank' + Math.random());
            document.forms[0].submit();

            this.steps.goto('code');
            // window.location.reload()
            div.innerHTML = '';

            // this.qrcode$.next(s.qrcode);
            // this.cashier_id$.next(s.cashier_id);

            interval(3000)
              .pipe(
                takeUntil(this.destory$),
                switchMap((a) => {
                  return this.http.get<any>(
                    `/wallet/cashier/heartbeat?id=${s.cashier_id}`
                  );
                }),
                tap((s) => {
                  if (s.status == 0) {
                    this.steps.goto('success');
                  } else if (s.status == 1) {
                    if (s.r == 1) {
                      // 超时
                      this.error$.next(2);
                    } else if (s.r === 102) {
                      this.error$.next(3);
                    }
                  }
                }),
                takeWhile((a) => a.status == 2)
              )
              .subscribe();
          },
          (e) => {
            if (e.code == 220) {
              this.modal
                .open(PopTips, [
                  '未设置支付密码，请前往安全&认证界面设置',
                  true,
                ])
                .afterClosed()
                .subscribe((s) => {
                  if (s) {
                    this.router.navigate(['/setting/security']);
                  }
                });
            }
          }
        );
    }
  }

  refresh() {
    this.error$.next(1);
    this.http
      .post<any>('/wallet/cashier/recharge', {
        amount: this.money$.value,
        channel: this.way$.value,
      })
      .subscribe(
        (s) => {
          this.qrcode$.next(s.qrcode);
          this.cashier_id$.next(s.cashier_id);

          interval(3000)
            .pipe(
              takeUntil(this.destory$),
              switchMap((a) => {
                return this.http.get<any>(
                  `/wallet/cashier/heartbeat?id=${s.cashier_id}`
                );
              }),
              tap((s) => {
                // console.log(s+22222)
                if (s.status == 0) {
                  this.steps.next();
                } else if (s.status == 1) {
                  if (s.r == 1) {
                    // 超时
                    this.error$.next(2);
                  } else if (s.r === 102) {
                    this.error$.next(3);
                  }
                  // console.log(this.error$.value);
                }
              }),
              takeWhile((a) => a.status == 2)
            )
            .subscribe();
        },
        (e) => {
          // console.log(e);
        }
      );
  }
  ngOnDestroy() {
    this.destory$.next();
    this.destory$.complete();
  }
}
