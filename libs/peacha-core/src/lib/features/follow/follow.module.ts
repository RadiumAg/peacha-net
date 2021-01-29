import { NgModule } from '@angular/core';
import { FollowDirective } from './follow.directive';

@NgModule({
	declarations: [FollowDirective],
	exports: [FollowDirective],
})
export class FollowModule {}
