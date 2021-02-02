import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@peacha-core';
import { CommentModule } from '../../fragments/comment/comment.module';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';
import { EfeActivityPage } from './pages/efe/efe-activity.page';
import { VupDebutPage } from './pages/vup-debut/vup-debut.page';

@NgModule({
	declarations: [EfeActivityPage, VupDebutPage],
	imports: [
		CommonModule,
		CommentModule,
		WorkRelatedModule,
		PeachaComponentsModule,
		ReactiveComponentModule,
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
		]),
	],
})
export class ActivityModule {}
