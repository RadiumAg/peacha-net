import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerPage } from './manager.page';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LiveManagerPage } from './live-manager/live-manager.page';
import { IllustManagerPage } from './illust-manager/illust-manager.page';
import { LiveSuccessPage } from './live-manager/live-success/live-success.page';
import { LiveFailPage } from './live-manager/live-fail/live-fail.page';
import { LiveAuditingPage } from './live-manager/live-auditing/live-auditing.page';
import { IllustAuditingPage } from './illust-manager/illust-auditing/illust-auditing.page';
import { IllustSuccessPage } from './illust-manager/illust-success/illust-success.page';
import { IllustFailPage } from './illust-manager/illust-fail/illust-fail.page';
import { SharedService } from './live-manager/live.service';
import { SingleManagerPage } from './single-manager/single-manager.page';
import { ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';
import { GoodsManager } from './single-manager/goods-manager/goods-manager';
import { ChangePrice } from './single-manager/change-price/change-price'
import { ThreeDManagerPage } from './3d-manager/3d-manager.page';
import { ThreeDAuditingPage } from './3d-manager/3d-auditing/3d-auditing.page';
import { ThreeDFailPage } from './3d-manager/3d-fail/3d-fail.page';
import { ThreeDSuccessPage } from './3d-manager/3d-success/3d-success.page';


@NgModule({
	declarations: [
		ManagerPage,
		GoodsManager,
		LiveManagerPage,
		IllustManagerPage,
		LiveSuccessPage,
		LiveFailPage,
		LiveAuditingPage,
		IllustAuditingPage,
		IllustSuccessPage,
		IllustFailPage,
		SingleManagerPage,
		ChangePrice,
		ThreeDManagerPage,
		ThreeDAuditingPage,
		ThreeDFailPage,
		ThreeDSuccessPage
	],
	imports: [
		ReactiveFormsModule,
		PeachaComponentsModule,
		CommonModule,
		ReactiveComponentModule,
		RouterModule.forChild([
			{
				path: '',
				// pathMatch: 'full',
				component: ManagerPage,
				children: [
					{
						path: '',
						redirectTo: 'illust',
					},
					{
						path: 'illust',
						component: IllustManagerPage,
						children: [
							{
								path: '',
								component: IllustSuccessPage,
							},
							{
								path: 'fail',
								component: IllustFailPage,
							},
							{
								path: 'auditing',
								component: IllustAuditingPage,
							},
						],
					},
					{
						path: 'live2D',
						component: LiveManagerPage,
						children: [
							{
								path: '',
								component: LiveSuccessPage,
							},
							{
								path: 'fail',
								component: LiveFailPage,
							},
							{
								path: 'auditing',
								component: LiveAuditingPage,
							},
						],
					},
					{
						path: '3d',
						component: ThreeDManagerPage,
						children: [
							{
								path: '',
								component: ThreeDSuccessPage,
							},
							{
								path: 'fail',
								component: ThreeDFailPage,
							},
							{
								path: 'auditing',
								component: ThreeDAuditingPage,
							},
						],
					},
				],
			},
		]),
	],
	providers: [SharedService],
})
export class ManagerModule { }
