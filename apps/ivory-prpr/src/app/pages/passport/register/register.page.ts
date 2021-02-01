import { TranslateService } from '@ngx-translate/core';
import { PopTips } from './../../../components/pop-tips/pop-tips';
import { ModalService } from './../../../core/service/modals.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { VerifycodeService, EVerifycodeType, Register, IvoryError } from 'src/app/core';
import { Store } from '@ngxs/store';
import { ActivatedRoute, Router } from '@angular/router';
import { HashLocationStrategy } from '@angular/common';

@Component({
    selector: 'ivo-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.less'],
})
export class RegisterPage implements OnInit {
    checkForm: FormGroup;
    constructor(
        private modal: ModalService,
        private fb: FormBuilder,
        private verify: VerifycodeService,
        private store: Store,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private translate: TranslateService
    ) {
        this.checkForm = this.fb.group({
            method: new FormControl('email', []),
            account: new FormControl('', [
                Validators.required,
                this.confirmValidator,
            ]),
            password: new FormControl('', [
                Validators.minLength(8),
                Validators.maxLength(16),
                Validators.pattern('^(?=.*[a-zA-Zd])[!-~]{8,16}$'),
            ]),
            verify_code: new FormControl(''),
            eula: new FormControl(false, [Validators.requiredTrue]),
        });
    }

    get method() {
        return this.checkForm.get('method');
    }

    get account() {
        return this.checkForm.get('account');
    }
    get password() {
        return this.checkForm.get('password');
    }
    get verify_code() {
        return this.checkForm.get('verify_code');
    }

    get formvalid() {
        return this.checkForm.valid;
    }
    private getTranslate(key) {
        let value;
        this.translate.get(key).subscribe((x) => {
            value = x;
        });
        return value;
    }

    queryVerifycode(v: VerifycodeFetchDirective) {
        if (this.account?.valid) {
            v.request(
                this.checkForm.value.method === 'phone'
                    ? this.account.value + ',86'
                    : this.account.value
            )
                .then(() => {
                    this.modal.open(PopTips, [
                        this.getTranslate(
                            'register.email_successful'
                        ),
                        false,
                        1,
                    ]);
                })
                .catch((e: IvoryError) => {
                    this.cdr.markForCheck();
                    switch (e.code) {
                        case 103: {
                            this.verify_code.setErrors({ nocorrect: true });
                            break;
                        }
                        case 106: {
                            this.account?.setErrors({ used: true });
                            break;
                        }
                        case 107: {
                            this.account?.setErrors({ used: true });
                            break;
                        }
                    }
                    this.cdr.detectChanges();
                });
        } else {
            this.account?.markAsTouched();
        }
    }

    ngOnInit() {
        this.store
            .selectOnce<number>((s) => s.user.id)
            .subscribe((i) => {
                if (i > 0) {
                    this.router.navigateByUrl('/setting');
                }
            });
    }

    submit() {
        if (this.checkForm.valid) {
            this.store
                .dispatch(
                    new Register(
                        this.checkForm.value.method === 'phone'
                            ? this.checkForm.value.account + ',86'
                            : this.checkForm.value.account,
                        this.checkForm.value.password,
                        this.checkForm.value.verify_code
                    )
                )
                .subscribe(
                    (_) => {
                        this.store.dispatch(new FetchMe()).subscribe((_) => {
                            this.router.navigate(['/passport/fill'], {
                                queryParamsHandling: 'preserve',
                            });
                        });
                    },
                    (e) => {
                        this.cdr.markForCheck();
                        switch (e.code) {
                            case 103: {
                                this.verify_code.setErrors({ nocorrect: true });
                                break;
                            }
                            case 106: {
                                this.account?.setErrors({ used: true });
                                break;
                            }
                            case 107: {
                                this.account?.setErrors({ used: true });
                                break;
                            }
                        }
                        this.cdr.detectChanges();
                    }
                );
        } else {
            //console.log(this.checkForm);
        }
    }

    confirmValidator = (account: FormControl): { [s: string]: boolean } => {
        if (this.checkForm?.value.method === 'phone') {
            const ruler1 = /^1[345789]\d{9}$/;
            const test1 = ruler1.test(account.value);
            if (test1) {
                return {};
            } else {
                return { invaild: true };
            }
        } else {
            const ruler2 = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
            const test2 = ruler2.test(account.value);
            if (test2) {
                return {};
            } else {
                return { invaild: true };
            }
        }
    };
}





