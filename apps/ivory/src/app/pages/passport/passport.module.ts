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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BindMailPage } from './bind-mail/bind-mail.page';
import { BindPhonePage } from './bind-phone/bind-phone.page';
import { UserAuthenticationPage } from './user-authentication/user-authentication.page';
import { AuthenticationSuccessPage } from './authentication-success/authentication-success.page';
import { AuthenticationFailPage } from './authentication-fail/authentication-fail.page';
import { AuthenticationWaitPage } from './authentication-wait/authentication-wait.page';
import { LoginResolve } from './login.guard';
import { PeachaComponentsModule, ReactiveComponentModule, VerifyModule } from '@peacha-core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';

@NgModule({
	declarations: [
		PassportFrame,
		FirstProfilePage,
		LoginPage,
		RegisterPage,
		ForgetPage,
		BindMailPage,
		BindPhonePage,
		UserAuthenticationPage,
		AuthenticationSuccessPage,
		AuthenticationFailPage,
		AuthenticationWaitPage,
	],
	imports: [
		CommonModule,
		ReactiveComponentModule,
		RouterModule.forChild([
			{
				path: 'login',
				component: LoginPage,
				canActivate: [LoginResolve],
			},
			{
				path: 'register',
				component: RegisterPage,
				canActivate: [LoginResolve],
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
				path: 'bind_email',
				component: BindMailPage,
			},
			{
				path: 'bind_phone',
				component: BindPhonePage,
			},
			{
				path: 'authenticate',
				component: UserAuthenticationPage,
			},
			{
				path: 'authenticate/success',
				component: AuthenticationSuccessPage,
			},
			{
				path: 'authenticate/fail',
				component: AuthenticationFailPage,
			},
			{
				path: 'authenticate/wait',
				component: AuthenticationWaitPage,
			},
		]),
		PeachaComponentsModule,
		ReactiveFormsModule,
		NzCheckboxModule,
		NzInputModule,
		NzSelectModule,
		VerifyModule,
		NzIconModule,
	],
	providers: [LoginResolve],
})
export class PassportModule {}
