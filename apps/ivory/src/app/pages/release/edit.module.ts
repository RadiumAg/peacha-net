import { IllustrateFreeComponent } from './illustrate/illustrate-free/illustrate-free.component';
import { Live2dPaidComponent } from './live2d/live2d-paid/live2d-paid.component';
import { ReleaseModule } from './release.module';
import { Live2dFreeComponent } from './live2d/live2d-free/live2d-free.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { IllustratePaidComponent } from './illustrate/illustrate-paid/illustrate-paid.component';

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
				component: IllustrateFreeComponent,
			},
			{
				path: 'illust/paid/:id',
				component: IllustratePaidComponent,
			},
		]),
	],
})
export class EditModule {}
