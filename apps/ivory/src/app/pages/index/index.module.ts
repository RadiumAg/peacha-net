import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IndexPage } from './index.page';

import { LoginIndexPage } from './login-index/login-index.page';
import { IndexResolve } from './index.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { HotOriginalWorkPage } from './hot-original-work/hot-original-work.page';
import { NewestWorkPage } from './newest-work/newest-work.page';
import { HotLiveWorkPage } from './hot-live-work/hot-live-work.page';
import { PublicWorkPage } from './public-work/public-work.page';
import { HotTagPage } from './hot-tag/hot-tag.page';
import { HotGoodPage } from './hot-good/hot-good.page';
import { UnloginIndexPage } from './unlogin-index/unlogin-index.page';
import { UnindexResolve } from './unindex.guard';
import { RecommendWorkCarousel } from './login-index/recommendWork-carousel/recommendWork-carousel';
import { ReactiveComponentModule } from '@peacha-core';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { PeachaStudioCoreModule } from '@peacha-studio-core';
import { Carousel } from './login-index/carousel/carousel';
import { FollowModule } from '@peacha-core/feature';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';
import { IndexApiService } from './index-api.service';

@NgModule({
	declarations: [
		IndexPage,
		LoginIndexPage,
		UnloginIndexPage,
		HotOriginalWorkPage,
		NewestWorkPage,
		HotLiveWorkPage,
		PublicWorkPage,
		HotTagPage,
		HotGoodPage,
		RecommendWorkCarousel,
		Carousel
	],
	imports: [
		ReactiveFormsModule,
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: IndexPage,
				children: [
					{
						path: '',
						component: UnloginIndexPage,
						canActivate: [IndexResolve],
					},
					{
						path: 'homepage',
						component: LoginIndexPage,
						canActivate: [UnindexResolve],
					},
					{
						path: 'hotgood',
						component: HotGoodPage,
					},
					{
						path: 'hotLive2DWork',
						component: HotLiveWorkPage,
					},
					{
						path: 'hotOriginalWork',
						component: HotOriginalWorkPage,
					},
					{
						path: 'hotTagWork',
						component: HotTagPage,
					},
					{
						path: 'newestWork',
						component: NewestWorkPage,
					},
					{
						path: 'publicWork',
						component: PublicWorkPage,
					},
				],
			},
		]),
		NzCheckboxModule,
		PeachaComponentsModule,
		ReactiveComponentModule,
		FollowModule,
		PeachaStudioCoreModule,
		WorkRelatedModule,
	],
	providers: [IndexResolve, UnindexResolve, IndexApiService],
})
export class IndexModule { }
