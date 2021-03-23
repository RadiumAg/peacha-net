import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@peacha-core';
import { CommentModule } from '../../fragments/comment/comment.module';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';
import { EfeActivityPage } from './pages/efe/efe-activity.page';
import { VupDebutPage } from './pages/vup-debut/vup-debut.page';
import { LiveActivityPage } from './pages/live-activity/live-activity.page';
import { ReactiveFormsModule } from '@angular/forms';
import { PeachaStudioCoreModule } from '@peacha-studio-core';
import { FollowModule } from '@peacha-core/feature';


@NgModule({
	declarations: [EfeActivityPage, VupDebutPage, LiveActivityPage],
	imports: [
		CommonModule,
		CommentModule,
		WorkRelatedModule,
		PeachaComponentsModule,
		ReactiveComponentModule,
		ReactiveFormsModule,
		PeachaStudioCoreModule,
		FollowModule,
		RouterModule.forChild([
			{
				path: '',
				redirectTo: 'vup-debut',
			},
			{
				path: 'efe',
				component: EfeActivityPage,
			},
			{
				path: 'vup-debut',
				component: VupDebutPage,
			},
			{
				path: 'aka',
				component: LiveActivityPage
			}
		]),
	],
})
export class ActivityModule { }
