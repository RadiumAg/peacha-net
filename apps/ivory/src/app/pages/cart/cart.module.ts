import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartPage } from './cart.page';
import { RouterModule } from '@angular/router';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';

@NgModule({
	declarations: [CartPage],
	imports: [
		NzCheckboxModule,
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: CartPage,
			},
		]),
		ReactiveComponentModule,
		PeachaComponentsModule,
	],
})
export class CartModule { }
