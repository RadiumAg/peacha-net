import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCheckboxModule, NzInputModule, NzSelectModule } from 'ng-zorro-antd';
// local imports
import { PassportFrame } from './passport.frame';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { ForgetPage } from './forget/forget.page';
import { FirstProfilePage } from './first-profile/first-profile.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReactiveComponentModule } from 'src/app/core/reactive';
import { VerifyModule } from 'src/app/features/verifycode/verifycode.module';
import { ModalService, ModalRef } from 'src/app/core/service/modals.service';
import { Cropper } from 'src/app/components/cropper/cropper';
import { ResetPasswordPage } from './reset-password/reset-password.page';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BindMailPage } from './bind-mail/bind-mail.page';
import { BindPhonePage } from './bind-phone/bind-phone.page';
import { UserAuthenticationPage } from './user-authentication/user-authentication.page';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

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
          useFactory: (http: HttpClient)=>{
            return new TranslateHttpLoader(http, './assets/i18n/', '.json')},
          deps: [HttpClient]
        }
      }),
    ComponentsModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzInputModule,
    NzSelectModule,
    VerifyModule,
    NzIconModule,
  ],
})
export class PassportModule {}
