import { PeachaCoreModule } from './core/peacha.module';
import { ConventionComponent } from './pages/convention/convention.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { UserCenterResolve } from './user-center.guard';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { NgxsModule, NoopNgxsExecutionStrategy, Store } from '@ngxs/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
// local imports
import { NavbarModule } from './fragments/navbar/navbar.module';
import { AppComponent } from './app.component';
import { FooterModule } from './fragments/footer/footer.module';
import { PublicityComponent } from './pages/publicity/publicity.component';
import { PublicityModule } from './pages/publicity/publicity.module';
import { AgreementComponent } from './pages/agreement/agreement.component';
import { UserPrivacyPolicyComponent } from './pages/user-privacy-policy/user-privacy-policy.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ReviewMechanismComponent } from './pages/review-mechanism/review-mechanism.component';
import { environment } from '../environments/environment';


const routes: Routes = [
  {
    path: 'convention',
    component: ConventionComponent,
    data: { keep: false },
  },
  {
    path: 'aboutus',
    component: AboutUsComponent,
    data: { keep: false },
  },
  {
    path: 'reviewMechanism',
    component: ReviewMechanismComponent,
    data: { keep: false },
  },
  {
    path: '',
    component: PublicityComponent,
    data: { keep: false },
  },
  {
    path: 'pay',
    loadChildren: () =>
      import('./pages/pay/pay.module').then((m) => m.PayModule),
    data: { keep: false },
  },
  {
    path: 'useragreement',
    component: AgreementComponent,
    data: { keep: false },
  },
  {
    path: 'userprivacypolicy',
    component: UserPrivacyPolicyComponent,
    data: { keep: false },
  },
  {
    path: 'passport',
    loadChildren: () =>
      import('./pages/passport/passport.module').then(
        (m) => m.PassportModule
      ),
    data: { keep: false },
  },
  {
    path: 'setting',
    loadChildren: () =>
      import('./pages/user-center/user-center.module').then(
        (m) => m.UserCenterModule
      ),
    canActivate: [UserCenterResolve],
    data: { keep: false },
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
    path: '**',
    loadChildren: () =>
      import('./pages/error/error.module').then((m) => m.ErrorModule),
  },
];

@NgModule({
  declarations: [
    AppComponent,
    AgreementComponent,
    UserPrivacyPolicyComponent,
  ],
  imports: [
    NavbarModule,
    BrowserModule,
    FooterModule,
    BrowserAnimationsModule,
    PeachaCoreModule.forRoot(),
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
    PublicityModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(
            http,
            './assets/i18n/',
            '.json'
          );
        },
        deps: [HttpClient],
      },
    }),
  ],
  providers: [UserCenterResolve],
  bootstrap: [AppComponent],
})
export class AppModule { }
