import { NgModule } from '@angular/core';
import { WorkLikeDirective } from './work-like.directive';

@NgModule({
	declarations: [WorkLikeDirective],
	exports: [WorkLikeDirective],
})
export class WorkLikeModule {}
