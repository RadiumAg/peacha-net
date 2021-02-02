import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkLive2dComponent } from './work-live2d.component';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@peacha-core';
import { CommentModule } from '../../fragments/comment/comment.module';
import { PeachaStudioCoreModule } from '@peacha-studio-core';
import { Live2DResolve } from './live2D.resolve';
import { WorkRelatedModule, PeachaComponentsModule } from '@peacha-core/components';

@NgModule({
	declarations: [WorkLive2dComponent],
	imports: [
		CommonModule,
		WorkRelatedModule,
		ReactiveComponentModule,
		CommentModule,
		PeachaComponentsModule,
		PeachaStudioCoreModule,
		RouterModule.forChild([
			{
				path: ':id',
				component: WorkLive2dComponent,
				resolve: {
					work: Live2DResolve,
				},
			},
		]),
	],
	providers: [Live2DResolve],
})
export class WorkLive2dModule { }
