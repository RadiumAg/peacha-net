import { WorkSearchGuard } from './work-search.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPage } from './search.page';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UserSearchPage } from './usersearch/usersearch.page';
import { GoodsearchPage } from './goodsearch/goodsearch.page';
import { WorkSearchPage } from './work-search/work-search.page';
import { ReactiveComponentModule, WorkApiService } from '@peacha-core';
import { FollowModule } from '@peacha-core/feature';
import { PeachaComponentsModule } from '@peacha-core/components';

@NgModule({
	declarations: [SearchPage, UserSearchPage, GoodsearchPage, WorkSearchPage],
	imports: [
		FollowModule,
		PeachaComponentsModule,
		ReactiveFormsModule,
		CommonModule,
		ReactiveComponentModule,
		RouterModule.forChild([
			{
				path: '',
				component: SearchPage,
				canActivate: [WorkSearchGuard],
				children: [
					{
						path: '',
						redirectTo: 'work',
					},
					{
						path: 'work',
						component: WorkSearchPage,
					},
					{
						path: 'user',
						component: UserSearchPage,
					},
					{
						path: 'good',
						component: GoodsearchPage,
					}
				],
			},
		]),
	],
	providers: [WorkApiService, WorkSearchGuard],
})
export class SearchModule { }
