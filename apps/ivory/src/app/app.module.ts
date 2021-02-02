import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
// local imports
import { NavbarModule } from './fragments/navbar/navbar.module';
import { AppComponent } from './app.component';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FooterModule } from './fragments/footer/footer.module';
import { AgreementComponent } from './pages/agreement/agreement.component';
import { UserPrivacyPolicyComponent } from './pages/user-privacy-policy/user-privacy-policy.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ReviewMechanismComponent } from './pages/review-mechanism/review-mechanism.component';
import { ConventionComponent } from './pages/convention/convention.component';
import { PlanningAgreementPage } from './pages/planning-agreement/planning-agreement.page';
import { PeachaCoreModule, PhoneGuard } from '@peacha-core';
import { environment } from '../environments/environment';

registerLocaleData(zh);
const routes: Routes = [
	{
		path: 'commission',
		loadChildren: () => import('./pages/commission/commission.module').then(x => x.CommissionModule),
	},
	{
		path: 'release',
		loadChildren: () => import('./pages/release/release.module').then(x => x.ReleaseModule),
		canActivate: [PhoneGuard],
	},
	{
		path: 'convention',
		component: ConventionComponent,
	},
	{
		path: 'planning-agreement',
		component: PlanningAgreementPage,
	},
	{
		path: 'reviewMechanism',
		component: ReviewMechanismComponent,
	},
	{
		path: 'aboutus',
		component: AboutUsComponent,
	},
	{
		path: 'useragreement',
		component: AgreementComponent,
	},
	{
		path: 'userprivacypolicy',
		component: UserPrivacyPolicyComponent,
	},
	{
		path: '',
		loadChildren: () => import('./pages/index/index.module').then(m => m.IndexModule),
	},
	{
		path: 'edit',
		loadChildren: () => import('./pages/release/edit.module').then(m => m.EditModule),
	},
	{
		path: 'passport',
		loadChildren: () => import('./pages/passport/passport.module').then(m => m.PassportModule),
	},
	{
		path: 'search',
		loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule),
	},
	{
		path: 'user',
		loadChildren: () => import('./pages/user/user.module').then(m => m.UserModule),
	},
	{
		path: 'setting',
		loadChildren: () => import('./pages/user-center/user-center.module').then(m => m.UserCenterModule),
	},
	{
		path: 'illust',
		loadChildren: () => import('./pages/work/work.module').then(m => m.WorkModule),
	},
	{
		path: 'live2d',
		loadChildren: () => import('./pages/work-live2d/work-live2d.module').then(m => m.WorkLive2dModule),
	},
	{
		path: 'pay',
		loadChildren: () => import('./pages/pay/pay.module').then(m => m.PayModule),
	},
	{
		path: 'order',
		loadChildren: () => import('./pages/order/order.module').then(m => m.OrderModule),
	},
	{
		path: 'cart',
		loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule),
	},
	{
		path: 'member',
		loadChildren: () => import('./pages/member/member.module').then(m => m.MemberModule),
	},
	{
		path: 'store',
		loadChildren: () => import('./pages/store/store.module').then(m => m.StoreModule),
	},
	{
		path: 'wallet',
		loadChildren: () => import('./pages/wallet/wallet.module').then(m => m.WalletModule),
	},
	{
		path: 'message',
		loadChildren: () => import('./pages/message/message.module').then(m => m.MessageModule),
	},
	{
		path: 'login',
		redirectTo: 'passport/login',
	},
	{
		path: 'register',
		redirectTo: 'passport/register',
	},
	{
		path: 'activity',
		loadChildren: () => import('./pages/activity/activity.module').then(m => m.ActivityModule),
	},
	{
		path: 'createrCertification',
		loadChildren: () => import('./pages/creater-certification/creater-certification.module').then(m => m.CreaterCertificationModule),
		canActivate: [PhoneGuard],
	},
	{
		path: '**',
		loadChildren: () => import('./pages/error/error.module').then(m => m.ErrorModule),
	},
];

@NgModule({
	declarations: [
		AppComponent,
		AgreementComponent,
		UserPrivacyPolicyComponent,
		AboutUsComponent,
		ReviewMechanismComponent,
		PlanningAgreementPage,
	],
	imports: [
		NavbarModule,
		BrowserModule,
		FooterModule,
		BrowserAnimationsModule,
		PeachaCoreModule.forRoot({
			api_gateway: environment.api_gateway,
		}),
		NgxsModule.forRoot([], {
			developmentMode: !environment.production,
			// executionStrategy: NoopNgxsExecutionStrategy
		}),
		RouterModule.forRoot(routes, {
			scrollPositionRestoration: 'top',
			anchorScrolling: 'enabled',
			scrollOffset: [0, 0],
		}),
		OverlayModule,
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
