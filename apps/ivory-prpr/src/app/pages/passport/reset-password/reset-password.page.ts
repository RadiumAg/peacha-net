import { Component, ViewChild, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, take, tap } from 'rxjs/operators';
import { Steps } from 'libs/peacha-core/src/lib/components/steps/steps';
import { FetchMe } from 'libs/peacha-core/src/lib/core/state/user.action';

@Component({
    selector: 'ivo-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrls: ['./reset-password.page.less']
})
export class ResetPasswordPage implements OnInit {
    constructor(
        private store: Store,
        private http: HttpClient,
        private fb: FormBuilder,
        private router: Router,
    ) {
        this.vericode = this.fb.control('', [Validators.required,]);
        this.password = this.fb.control('', [Validators.required, Validators.pattern('[0-9]{0,6}$')]);
        this.passwordagain = this.fb.control('', [this.confirmValidator]);
    }

    showtext: any;
    vericode: FormControl;
    password: FormControl;
    passwordagain: FormControl;
    mobile: any;
    emailtext: any;
    flag: true;
    avatar: any;
    @ViewChild(Steps) steps: Steps;
    style: any;

    countbutton = '';
    countdown$ = new BehaviorSubject<number>(60)
    iscountdown: boolean;



    token: any;
    wrong_code: any;

    ngOnInit(): void {
        this.store.select(state => { this.mobile = state.user.phone; }).subscribe();
        this.store.select(state => { this.emailtext = state.user.email; }).subscribe();
        this.store.select(state => { this.avatar = state.user.avatar; }).subscribe();

    }
    phone() {
        this.style = 0;
        this.sendverify();
    }
    email(): void {
        this.style = 1;
        this.sendverify();

    }
    sendverify() {
        this.http.post('/api/v1/common/request_target_verify_code', {
            t: this.style,
            p: 5
        }).subscribe(s => {
            if (this.style === 0) {
                this.showtext = '手机' + this.mobile;
            } else {
                this.showtext = '邮箱' + this.emailtext;
            }
            this.steps.next();

            interval(1000).pipe(
                take(60),
                tap(
                    (v) => {
                        this.countdown$.next(59 - v);
                    },
                    (e) => { },
                    () => { }
                )
            ).subscribe()
        }, e => {
            //console.log(e);
        });
    }

    sendverifyagain() {
        this.http.post('/api/v1/common/request_target_verify_code', {
            t: this.style,
            p: 5
        }).subscribe(s => {
            interval(1000).pipe(
                take(60),
                tap(
                    (v) => {
                        this.countdown$.next(59 - v);
                    },
                    (e) => { },
                    () => { }
                )
            ).subscribe()
        }, e => {
            //console.log(e);
        });
    }



    count() {
        if (this.iscountdown == true) {


        }
    }

    confirmVericode(): void {
        this.http.post<any>('/api/v1/common/get_target_verify_token', {
            t: this.style,
            p: 5,
            v: this.vericode.value
        }).subscribe(s => {
            this.token = s.token;
            this.steps.next();
        }, e => {
            this.vericode.setErrors({
                wrong_code: true
            });
        });
    }

    resetpw(): void {

        this.http.post('/api/v1/wallet/password/setup', {
            t: this.token,
            n: this.passwordagain.value
        }).subscribe(s => {
            this.steps.next();
            this.store.dispatch(new FetchMe()).subscribe();
        }, e => {
        });
    }

    confirmPasswordValidator(password: FormControl): { [s: string]: boolean } {
        if (!password.value) {
            return { error: true, required: true };
        } else if (password.value !== this.passwordagain.value && this.passwordagain.touched) {
            return { confirm: true, error: true };
        }
        return {};
    }
    confirmValidator = (passwordagain: FormControl): { [s: string]: boolean } => {
        if (!passwordagain.value) {
            return { error: true, required: true };
        } else if (passwordagain.value !== this.password.value) {
            return { confirm: true, error: true };
        }
        return {};
    }

}
