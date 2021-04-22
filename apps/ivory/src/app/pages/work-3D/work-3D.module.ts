import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@peacha-core';
import { CommentModule } from '../../fragments/comment/comment.module';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';
import { Work3DPage } from './work-3D.page';
import { Work3DResolve } from './work-3D.resolve';

@NgModule({
	declarations: [Work3DPage],
	imports: [
		CommonModule,
		WorkRelatedModule,
		PeachaComponentsModule,
		RouterModule.forChild([
			{
				path: ':id',
				component: Work3DPage,
				resolve: {
					work: Work3DResolve,
				},
			},
		]),
		ReactiveComponentModule,
		CommentModule,
	],
	providers: [Work3DResolve],
})
export class Work3DModule { }
