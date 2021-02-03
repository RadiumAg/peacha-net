import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkPage } from './work.page';
import { RouterModule } from '@angular/router';
import { IllustZoomModalComponent } from './illust-zoom-modal/illust-zoom-modal.component';
import { ReactiveComponentModule } from '@peacha-core';
import { CommentModule } from '../../fragments/comment/comment.module';
import { WorkResolve } from './work.resolve';
import { PeachaComponentsModule, WorkRelatedModule } from '@peacha-core/components';

@NgModule({
	declarations: [WorkPage, IllustZoomModalComponent],
	imports: [
		CommonModule,
		WorkRelatedModule,
		PeachaComponentsModule,
		RouterModule.forChild([
			{
				path: ':id',
				component: WorkPage,
				resolve: {
					work: WorkResolve,
				},
			},
		]),
		ReactiveComponentModule,
		CommentModule,
	],
	providers: [WorkResolve],
})
export class WorkModule { }
