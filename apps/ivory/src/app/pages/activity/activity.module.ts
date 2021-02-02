import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityPage } from './activity.page';
import { ReactiveComponentModule } from '@peacha-core';
import { CommentModule } from '../../fragments/comment/comment.module';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';

@NgModule({
	declarations: [ActivityPage],
	imports: [
		CommonModule,
		CommentModule,
		WorkRelatedModule,
		PeachaComponentsModule,
		ReactiveComponentModule,
		RouterModule.forChild([
			{
				path: '',
				component: ActivityPage,
			},
		]),
	],
})
export class ActivityModule { }
