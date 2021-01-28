import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { CreaterCertificationGuard } from './creater-certification.guard';
import { CreaterCertificationComponent } from './creater-certification/creater-certification.component';
import { ScreenshotComponent } from './components/screenshot/screenshot.component';
import { SubmittedForReviewComponent } from './submitted-for-review/submitted-for-review.component';
import { ReactiveComponentModule, RoleApiService } from '@peacha-core';
import { ComponentsModule } from '../commission/components/components.module';

const routes: Routes = [
  {
    path: 'review',
    component: SubmittedForReviewComponent,
    data: {
      title: '您已提交审核，请耐心等待',
    },
  },
  {
    path: 'painterreviewsuccess',
    component: SubmittedForReviewComponent,
    data: {
      title: '审核成功',
      imgSrc: '/assets/image/icons/02.png',
    },
  },
  {
    path: 'painterreviewfail',
    component: SubmittedForReviewComponent,
    data: {
      title: '审核失败',
      imgSrc: '/assets/image/icons/03.png',
      buttonTitle: '重新审核',
      backRoute: '/createrCertification/11002',
    },
  },
  {
    path: 'modelerreviewsuccess',
    component: SubmittedForReviewComponent,
    data: {
      title: '审核成功',
      imgSrc: '/assets/image/icons/02.png',
    },
  },
  {
    path: 'modelerreviewfail',
    component: SubmittedForReviewComponent,
    data: {
      title: '审核失败',
      imgSrc: '/assets/image/icons/03.png',
      buttonTitle: '重新审核',
      backRoute: '/createrCertification/11001',
    },
  },
  {
    path: ':role',
    component: CreaterCertificationComponent,
    canActivate: [CreaterCertificationGuard],
  },
];

@NgModule({
  declarations: [
    CreaterCertificationComponent,
    ScreenshotComponent,
    SubmittedForReviewComponent,
  ],
  imports: [
    CommonModule,
    ReactiveComponentModule,
    ComponentsModule,
    RouterModule.forChild(routes),
  ],
  providers: [CreaterCertificationGuard, RoleApiService],
})
export class CreaterCertificationModule {}
