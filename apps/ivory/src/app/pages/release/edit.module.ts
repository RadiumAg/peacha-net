import { Live2dPaidComponent } from './live2d/live2d-paid/live2d-paid.component';
import { ReleaseModule } from './release.module';
import { IllustrateComponent } from './illustrate/illustrate.component';
import { Live2dFreeComponent } from './live2d/live2d-free/live2d-free.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

@NgModule({
	declarations: [],
	imports: [
		ReleaseModule,
		RouterModule.forChild([
			{
				path: 'live2d/:id',
				component: Live2dFreeComponent,
			},
			{
				path: 'live2d/paid/:id',
				component: Live2dPaidComponent,
			},
			{
				path: 'illust/:id',
				component: IllustrateComponent,
			},
		]),
	],
})
export class EditModule {}
