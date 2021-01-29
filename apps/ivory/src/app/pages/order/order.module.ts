import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderPage } from './order.page';
import { RouterModule } from '@angular/router';
import { CanNot } from './can-not/can-not';
import { ReactiveComponentModule } from '@peacha-core';

@NgModule({
	declarations: [OrderPage, CanNot],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: 'create',
				component: OrderPage,
				pathMatch: 'full',
			},
		]),
		ReactiveComponentModule,
	],
})
export class OrderModule {}
