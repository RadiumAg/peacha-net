import { CommissionApiService } from './service/commission-api.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionIndexComponent } from './commission-index/commission-index.component';
import { RouterModule } from '@angular/router';
import { CommissionDetailComponent } from './commission-detail/commission-detail.component';
import { CommissionRegistration } from './commission-detail/commission-pop-component/commission-registration/commission-registration';
import { CommissionPainter } from './commission-detail/commission-pop-component/commission-painter/commission-painter';
import { CommissionCardComponent } from './commission-index/commission-card/commission-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommissionDetailService } from './service/detail.service';
import { CommissionDetailResolve } from './commission-detail.resolve';
import { CommissionOvertime } from './commission-detail/commission-pop-component/commission-overtime/commission-overtime';
import { CommissionReject } from './commission-detail/commission-pop-component/commission-reject/commission-reject';
import { CommissionGuard } from './commission.guard';
import { ComponentsModule as com, ComponentsModule } from './components/components.module';
import { CommissionTimeout } from './commission-detail/commission-pop-component/commission-timeout/commission-timeout';
import { CommissionPrevent } from './commission-detail/commission-pop-component/commission-prevent/commission-prevent';
import { CommissionAddmoney } from './commission-detail/commission-pop-component/commission-addmoney/commission-addmoney';
import { CommissionDiscontinuePage } from './commission-detail/commission-discontinue/commission-discontinue.page';
import { CommissionDetailNodelistPage } from './commission-detail/commission-detail-nodelist/commission-detail-nodelist.page';
import { CommissionDetailRegistrationlistPage } from './commission-detail/commission-detail-registrationlist/commission-detail-registrationlist.page';
import { CommissionDetailSteps } from './commission-detail/commission-detail-nodelist/commisson-detail-steps/commisson-detail-steps';
import { CommissionDetailNeedsPage } from './commission-detail/commission-detail-needs/commission-detail-needs.page';
import { CommissionCreatetipPage } from './commission-detail/commission-createtip/commission-createtip.page';
import { CommissionPaymentHistoryPage } from './commission-detail/commission-payment-history/commission-payment-history.page';
import { CommissionTopNav } from './commission-detail/commission-pop-component/commission-top-nav/commission-top-nav';
import { CommissionDiscontinueRejectFilePage } from './commission-detail/commission-discontinue-reject-file/commission-discontinue-reject-file.page';
import { CommissionDetailErrorService } from './commission-detail/commission-detail-error.service';
import { CommissionRemindedPage } from './commission-reminded/commission-reminded.page';
import { TechnologicalProcessComponent } from './technological-process/technological-process.component';
import { PhoneGuard, ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';

@NgModule({
	declarations: [
		CommissionIndexComponent,
		CommissionDetailComponent,
		CommissionDetailRegistrationlistPage,
		CommissionRegistration,
		CommissionPainter,
		CommissionCardComponent,
		CommissionDetailSteps,
		CommissionDetailNodelistPage,
		CommissionDetailNeedsPage,
		CommissionOvertime,
		CommissionReject,
		CommissionTimeout,
		CommissionPrevent,
		CommissionDiscontinuePage,
		CommissionAddmoney,
		CommissionCreatetipPage,
		CommissionPaymentHistoryPage,
		CommissionTopNav,
		CommissionDiscontinueRejectFilePage,
		CommissionRemindedPage,
	],
	imports: [
		PeachaComponentsModule,
		ReactiveFormsModule,
		CommonModule,
		ReactiveComponentModule,
		ReactiveFormsModule,
		com,
		RouterModule.forChild([
			{
				path: '',
				component: CommissionIndexComponent,
				canActivate: [CommissionGuard],
			},
			{
				path: 'detail',
				component: CommissionDetailComponent,
				resolve: {
					commisson: CommissionDetailResolve,
				},
				children: [
					{
						path: '',
						component: CommissionDetailNeedsPage,
					},
					{
						path: 'node',
						component: CommissionDetailNodelistPage,
					},
					{
						path: 'discontinue',
						component: CommissionDiscontinuePage,
					},
					{
						path: 'registrationlist',
						component: CommissionDetailRegistrationlistPage,
					},
					{
						path: 'createtip',
						component: CommissionCreatetipPage,
					},
					{
						path: 'payment',
						component: CommissionPaymentHistoryPage,
					},
					{
						path: 'reject-file',
						component: CommissionDiscontinueRejectFilePage,
					},
				],
			},
			{
				path: 'reminded',
				component: CommissionRemindedPage,
			},
			{
				path: 'technological',
				component: TechnologicalProcessComponent,
			},
			{
				path: 'publish',
				loadChildren: () =>
					import('./commission-publish/commission-select-type/commission-select.module').then(x => x.CommissionSelectModule),
				canActivate: [PhoneGuard],
			},
			{
				path: 'publish/live2d',
				loadChildren: () =>
					import('./commission-publish/commission-publish-live2d/commission-publish-live2d.module').then(
						x => x.CommissionPublishLive2dModule
					),
				canActivate: [PhoneGuard],
			},
			{
				path: 'publish/illust',
				loadChildren: () =>
					import('./commission-publish/commission-publish-illustration/commission-publish-illustration.module').then(
						x => x.CommissionPublishIllustrationModule
					),
				canActivate: [PhoneGuard],
			},
		]),
		ReactiveComponentModule,
		ComponentsModule,
	],
	providers: [CommissionApiService, CommissionDetailService, CommissionDetailResolve, CommissionGuard, CommissionDetailErrorService],
})
export class CommissionModule { }
