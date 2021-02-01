import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
// local imports
import { PassportFrame } from './passport.frame';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { ForgetPage } from './forget/forget.page';
import { FirstProfilePage } from './first-profile/first-profile.page';
import { ResetPasswordPage } from './reset-password/reset-password.page';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BindMailPage } from './bind-mail/bind-mail.page';
import { BindPhonePage } from './bind-phone/bind-phone.page';
import { UserAuthenticationPage } from './user-authentication/user-authentication.page';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ReactiveComponentModule, VerifyModule, PeachaComponentsModule } from '@peacha-core';


@NgModule({
  declarations: [
    PassportFrame,
    FirstProfilePage,
    LoginPage,
    RegisterPage,
    ForgetPage,
    ResetPasswordPage,
    BindMailPage,
    BindPhonePage,
    UserAuthenticationPage,
  ],
  imports: [
    CommonModule,
    ReactiveComponentModule,
    RouterModule.forChild([
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'register',
        component: RegisterPage,
      },
      {
        path: 'forget_password',
        component: ForgetPage,
      },
      {
        path: 'fill',
        component: FirstProfilePage,
      },
      {
        path: 'password',
        component: ResetPasswordPage,
      },
      {
        path: 'bind_email',
        component: BindMailPage,
      },
      {
        path: 'bind_phone',
        component: BindPhonePage,
      }
    ]),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, './assets/i18n/', '.json')
        },
        deps: [HttpClient]
      }
    }),
    PeachaComponentsModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzInputModule,
    NzSelectModule,
    VerifyModule,
    NzIconModule,
  ],
})
export class PassportModule { }
