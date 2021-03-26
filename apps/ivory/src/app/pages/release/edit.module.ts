import { IllustrateFreeComponent } from './illustrate/illustrate-free/illustrate-free.component';
import { Live2dPaidComponent } from './live2d/live2d-paid/live2d-paid.component';
import { ReleaseModule } from './release.module';
import { Live2dFreeComponent } from './live2d/live2d-free/live2d-free.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { IllustratePaidComponent } from './illustrate/illustrate-paid/illustrate-paid.component';
import { ThreeModelFreeComponent } from './3dModel/3dModel-free/3dModel-free.component';
import { PhoneGuard,UserBanStatusGuard } from '@peacha-core';
import { ThreeModelPaidComponent } from './3dModel/3dModel-paid/3dModel-paid.component';

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
			{
				path: '3d/free/:id',
				component: ThreeModelFreeComponent,
				canActivate: [PhoneGuard,UserBanStatusGuard]
			},
			{
				path: '3d/onlyShow/:id',
				component: ThreeModelFreeComponent,
				canActivate: [PhoneGuard,UserBanStatusGuard]
			},
			{
				path: '3d/paid/:id',
				component: ThreeModelPaidComponent,
				canActivate: [PhoneGuard,UserBanStatusGuard]
			}
		]),
	],
})
export class EditModule { }
