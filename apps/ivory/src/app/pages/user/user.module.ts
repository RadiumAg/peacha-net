import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserPage } from './user.page';
import { UserGuard } from './user.guard';
import { UserResolve } from './user.resolve';
import { CollectionPage } from './collection/collection.page';
import { HomepagePage } from './homepage/homepage.page';
import { CreatedPage } from './created/created.page';
import { CollectionIntroducePage } from './collection-introduce/collection-introduce.page';
import { SubscribedPage } from './subscribed/subscribed.page';
import { WorksPage } from './works/works.page';
import { Complain } from './collection-introduce/complain/complain';
import { DeleteTip } from './collection-introduce/delete-tip/delete-tip';
import { NewCollection } from './created/new-collection/new-collection';
import { ReactiveFormsModule } from '@angular/forms';
import { UserinfoComponent } from './follow-list/userinfo/userinfo.component';
import { FollowingComponent } from './follow-list/following/following.component';
import { FollowerComponent } from './follow-list/follower/follower.component';
import { ReactiveComponentModule, WorkApiService } from '@peacha-core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { PeachaComponentsModule } from '@peacha-core/components';
import { FollowModule } from '@peacha-core/feature';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
	declarations: [
		UserPage,
		FollowerComponent,
		FollowingComponent,
		UserinfoComponent,
		CollectionPage,
		HomepagePage,
		CreatedPage,
		CollectionIntroducePage,
		SubscribedPage,
		WorksPage,
		Complain,
		DeleteTip,
		NewCollection
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		PeachaComponentsModule,
		ScrollingModule,
		RouterModule.forChild([
			{
				path: ':id',
				component: UserPage,
				children: [
					// {
					//   path: 'follow',
					//   component: FollowListPage,
					//   children: [
					//     {
					//       path: 'follower',
					//       component: FollowerComponent
					//     },
					//     {
					//       path: 'following',
					//       component: FollowingComponent
					//     },
					//     // {
					//     //   path:'**',
					//     //   redirectTo:'follower'
					//     // }
					//   ]
					// },
					{
						path: 'follower',
						component: FollowerComponent,
					},
					{
						path: 'following',
						component: FollowingComponent,
					},
					{
						path: '',
						component: HomepagePage,
					},
					{
						path: 'works',
						component: WorksPage,
					},
					{
						path: 'collection',
						component: CollectionPage,
					},
					{
						path: 'collection/created',
						component: CreatedPage,
					},
					{
						path: 'collection/subscribed',
						component: SubscribedPage,
					},
					{
						path: 'collection/:id',
						component: CollectionIntroducePage,
					},
					{
						path: '**',
						redirectTo: '',
					},
				],
				canActivate: [UserGuard],
				resolve: {
					user: UserResolve,
				},
			},
			{
				path: '**',
				redirectTo: '/user/',
			},
		]),
		FollowModule,
		ReactiveComponentModule,
		NzDropDownModule
	],
	providers: [UserGuard, UserResolve, WorkApiService],
})
export class UserModule { }
