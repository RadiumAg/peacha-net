import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ChangeDetectorRef, ɵConsole } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Store, Select } from '@ngxs/store';
import { Router, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot, RoutesRecognized } from '@angular/router';
import { Subject, combineLatest, empty, merge, Observable, BehaviorSubject } from 'rxjs';
import { map, tap, filter, pairwise, take } from 'rxjs/operators';
import { UserState } from '../../../core/state/user.state';
import { Toast } from '../../../core/toast/toast.service';

@Component({
  selector: 'ivo-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.less']
})
export class LoginPage implements OnInit{
  @Select(UserState.isLogin)
  isLogin$: Observable<boolean>;
  constructor(
    private fb: FormBuilder, private store: Store, private router: Router, private toast: Toast,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private translateService:TranslateService
  ) {
    this.loginForm = this.fb.group({
      account: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern('^(?=.*[a-zA-Z\d])[!-~]{8,16}$')])
    });
  }

  ngOnInit() {
    this.store.selectOnce<number>(s => s.user.id).subscribe(i => {
        if (i > 0) {
            this.router.navigateByUrl('/setting');
        }
    })
}

  get account() {
    return this.loginForm.get('account');
  }

  get password() {
    return this.loginForm.get('password');
  }
  loginForm: FormGroup;


  changeValue() {
    this.loginForm.valueChanges.pipe(
      take(1)
    ).subscribe(_ => {
      this.password.setValue('')
    })
  }


  password_async_error: any;
  previousUrl$ = new BehaviorSubject<string>('');
  currentUrl$ = new BehaviorSubject<string>('');


  async login(e: MouseEvent) {
    this.store.selectOnce<number>(s => s.user.id).pipe(
      tap(s => {
        if (s > 0) {
        } else {

          if (!this.loginForm.valid) {
            return;
          }

          this.store.dispatch(new Login(String(this.loginForm.value.account).includes('@') ? this.loginForm.value.account : this.loginForm.value.account + ',86', this.loginForm.value.password)).subscribe(s => {
            this.route.queryParams.subscribe(s => {
              if (s.return) {
                this.router.navigateByUrl(s.return);
              } else {
                this.router.navigate(['/']);
              }
            })
          }, e => {
            if (e instanceof IvoryError) {
              const errors: {
                wrong_password?: boolean,
                user_not_exist?: boolean
              } = {};
              switch (e.code) {
                case 101:
                  errors.user_not_exist = true;
                  this.account?.setErrors(errors);
                  break;
                case 102:
                  errors.wrong_password = true;
                  this.password?.setErrors(errors);
                  break;
              }
              this.cdr.markForCheck();
            }
          }, () => {

          });
        }
      })
    ).subscribe()
  }

  remote_account_errors(cont: AbstractControl) { // cold pipe
    return merge(
      cont.valueChanges.pipe(map(s => {
        return {};
      })),

    );
  }
  remote_password_errors() {
    return this.password_async_error;
  }

}
