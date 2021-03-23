import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberPage } from './member.page';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RecordPage } from './record/record.page';
import { RecordDetailPage } from './record/record-detail/record-detail.page';
import { ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';
import { MemberApiService } from './member-api.service';

@NgModule({
	declarations: [MemberPage, RecordPage, RecordDetailPage],
	imports: [
		ReactiveFormsModule,
		PeachaComponentsModule,
		CommonModule,
		ReactiveComponentModule,
		RouterModule.forChild([
			{
				path: '',
				// pathMatch: 'full',
				component: MemberPage,
				children: [
					{
						path: 'manager',
						loadChildren: () => import('./manager/manager.module').then(m => m.ManagerModule),
					},
					{
						path: 'record',
						component: RecordPage,
					},
					{
						path: 'record/redetail',
						component: RecordDetailPage,
					},
					{
						path: 'cooperate',
						loadChildren: () => import('./cooperate/cooperate.module').then(m => m.CooperateModule),
					},
				],
			},
		]),
	],
	providers: [MemberApiService],
})
export class MemberModule { }
