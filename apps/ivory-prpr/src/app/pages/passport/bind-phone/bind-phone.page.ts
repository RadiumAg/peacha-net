import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { Steps } from 'src/app/components/steps/steps';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import {
    FormControl,
    Validators,
    FormBuilder,
} from '@angular/forms';
import {
    Observable,
    Subscription,
    combineLatest,
    BehaviorSubject,
    empty,
    interval,
    Subject,
} from 'rxjs';
import { FetchMe } from 'src/app/core/state/user.action';
import { Router } from '@angular/router';
import { tap, map, switchMap, take, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'ivo-bind-phone',
    templateUrl: './bind-phone.page.html',
    styleUrls: ['./bind-phone.page.less'],
})
export class BindPhonePage {
    constructor(
        private http: HttpClient,
        private store: Store,
        private fb: FormBuilder,
        private cc: ChangeDetectorRef,
        private router: Router
    ) {
        this.verifyCode = this.fb.control('', [Validators.required]);
        this.verifyCode2 = this.fb.control('', [Validators.required]);
        this.phoneText = this.fb.control('', [
            Validators.required,
            Validators.maxLength(11),
            Validators.minLength(11),

        ]);
        this.email$ = this.store.select((s) => s.user.email);
        this.phone$ = this.store.select((s) => s.user.phone);
    }
    @ViewChild(Steps) steps: Steps;
    phoneText: FormControl;
    email$: Observable<string>;
    phone$: Observable<string>;
    verifyCode: FormControl;
    verifyCode2: FormControl;

    cooldown$ = new BehaviorSubject<number>(0);
    requesting$ = new BehaviorSubject<boolean>(false);
    sp?: Subscription;

    cooldown2$ = new BehaviorSubject<number>(0);
    requesting2$ = new BehaviorSubject<boolean>(false);
    sp2?: Subscription;
    c$=new Subject

    token: any;
    sendVerifyToEmail() {
        this.sp = combineLatest(this.cooldown$, this.requesting$)
            .pipe(
                take(1),
                switchMap(([cooldown, requesting]) => {
                    if (cooldown > 0 || requesting) {
                        return empty();
                    }
                    this.requesting$.next(true);
                    return this.http
                        .post('/api/v1/common/request_target_verify_code', {
                            t: 1,
                            p: 2,
                        })
                        .pipe(
                            tap(
                                () => {
                                    this.requesting$.next(false);
                                    this.steps.next();
                                },
                                () => {
                                    this.requesting$.next(false);
                                },
                                () => {}
                            ),
                            switchMap((_) => {
                                this.cooldown$.next(60);

                                return interval(1000).pipe(
                                    takeUntil(this.c$),
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
                () => {}
            );
    }

    sendVerifyToEmailAgain() {
        this.sp = combineLatest([this.cooldown$, this.requesting$])
            .pipe(
                take(1),
                switchMap(([cooldown, requesting]) => {
                    if (cooldown > 0 || requesting) {
                        return empty();
                    }
                    this.requesting$.next(true);
                    return this.http
                        .post('/api/v1/common/request_target_verify_code', {
                            t: 1,
                            p: 2,
                        })
                        .pipe(
                            tap(
                                () => {
                                    this.requesting$.next(false);
                                },
                                () => {
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
                () => {}
            );
    }
a$=new BehaviorSubject<string>('')
    sendVerifyToPhone() {
        this.c$.next()
        this.c$.complete()
        this.sp2 = combineLatest(this.cooldown2$, this.requesting2$)
            .pipe(
                take(1),
                switchMap(([cooldown, requesting]) => {
                    if (cooldown > 0 || requesting) {
                        return empty();
                    }
                    this.requesting$.next(true);
                    return this.http
                        .post('/api/v1/common/request_reset_verify_code', {
                            a: this.phoneText.value + ',86',
                            t: this.token,
                        })
                        .pipe(
                            tap(
                                () => {
                                    this.steps.next();
                                    this.requesting$.next(false);
                                },
                                e => {
                                    this.requesting$.next(false);
                                    if (e.code == 106) {
                                    this.phoneText.setErrors({
                                        register: true
                                    });
                                    }
                                    else if (e.code == 109) {
                                    this.phoneText.setErrors({
                                        time: true
                                    });
                                }
                                this.a$.next(' ')
                                },
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
                () => {}
            );
    }
    sendVerifyToPhoneAgain() {
        this.sp2 = combineLatest([this.cooldown2$, this.requesting2$])
            .pipe(
                take(1),
                switchMap(([cooldown, requesting]) => {
                    if (cooldown > 0 || requesting) {
                        return empty();
                    }
                    this.requesting$.next(true);
                    return this.http
                        .post('/api/v1/common/request_reset_verify_code', {
                            a: this.phoneText.value + ',86',
                            t: this.token,
                        })
                        .pipe(
                            tap(
                                () => {
                                    this.requesting$.next(false);
                                },
                                () => {
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
                () => {}
            );
    }

    emailVertify() {
        // this.steps.next()
        this.http
            .post<{
                token: string;
            }>('/api/v1/common/get_target_verify_token', {
                t: 1,
                p: 2,
                v: this.verifyCode2.value.replace(/\s*/g, ''),
            })
            .subscribe(
                (s) => {
                    this.steps.next();
                    this.token = s.token;
                    this.cc.markForCheck();
                },
                (e) => {
                    this.cc.markForCheck();

                    this.verifyCode2.setErrors({
                        wrong_code: true,
                    });
                }
            );
    }

    finishBind() {
        //    this.steps.next()

        this.http
            .post('/api/v1/user/reset_phone', {
                n: this.phoneText.value + ',86',
                v: this.verifyCode.value,
            })
            .subscribe(
                (s) => {
                    this.steps.next();
                },
                (e) => {
                    //console.log(e);
                    this.verifyCode.setErrors({
                        wrong_code: true,
                    });
                }
            );
    }
    skip() {
        this.router.navigate(['setting']);
        // location.replace("./")
        this.store.dispatch(new FetchMe()).subscribe();
    }
}
