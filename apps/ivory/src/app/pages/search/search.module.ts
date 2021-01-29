import { WorkSearchGuard } from './work-search.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPage } from './search.page';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UserSearchPage } from './usersearch/usersearch.page';
import { GoodsearchPage } from './goodsearch/goodsearch.page';
import { WorkSearchPage } from './work-search/work-search.page';
import { FollowModule } from 'libs/peacha-core/src/lib/features/follow/follow.module';
import { PeachaComponentsModule, ReactiveComponentModule, WorkApiService } from '@peacha-core';

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
				children: [
					{
						path: '',
						component: WorkSearchPage,
						canActivate: [WorkSearchGuard],
					},
					{
						path: 'user',
						component: UserSearchPage,
					},
					{
						path: 'good',
						component: GoodsearchPage,
					},
					{
						path: '**',
						redirectTo: 'all',
					},
				],
			},
		]),
	],
	providers: [WorkApiService, WorkSearchGuard],
})
export class SearchModule {}
