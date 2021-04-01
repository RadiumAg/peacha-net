import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule, WorkApiService } from '@peacha-core';
import { FollowModule } from '@peacha-core/feature';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';
import { SelectWorkPage } from './select-work/select-work.page';
import { SelectGoodPage } from './select-good/select-good.page';
import { SelectPage } from './select.page';
import { IndexApiService } from '../index/index-api.service';

@NgModule({
	declarations: [SelectPage, SelectWorkPage, SelectGoodPage],
	imports: [
		FollowModule,
		PeachaComponentsModule,
		ReactiveFormsModule,
		CommonModule,
		ReactiveComponentModule,
		WorkRelatedModule,
		RouterModule.forChild([
			{
				path: '',
				component: SelectPage,
				children: [
					{
						path: 'work',
						component: SelectWorkPage
					},
					{
						path: 'good',
						component: SelectGoodPage
					}
				],
			},
		]),
	],
	providers: [WorkApiService, IndexApiService],
})
export class SelectModule { }
