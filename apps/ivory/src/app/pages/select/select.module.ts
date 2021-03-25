import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule, WorkApiService } from '@peacha-core';
import { FollowModule } from '@peacha-core/feature';
import { PeachaComponentsModule } from '@peacha-core/components';
import { SelectWorkPage } from './select-work/select-work.page';
import { SelectGoodPage } from './select-good/select-good.page';
import { SelectPage } from './select.page';

@NgModule({
	declarations: [SelectPage, SelectWorkPage, SelectGoodPage],
	imports: [
		FollowModule,
		PeachaComponentsModule,
		ReactiveFormsModule,
		CommonModule,
		ReactiveComponentModule,
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
	providers: [WorkApiService],
})
export class SelectModule { }
