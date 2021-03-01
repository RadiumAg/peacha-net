import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderPage } from './order.page';
import { RouterModule } from '@angular/router';
import { CanNot } from './can-not/can-not';
import { ReactiveComponentModule } from '@peacha-core';
import { CommissionOrderPage } from './commission-order/commission-order.page';

@NgModule({
	declarations: [OrderPage, CanNot, CommissionOrderPage],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: 'create',
				component: OrderPage,
				pathMatch: 'full',
			}, {
				path: 'commission-order',
				component: CommissionOrderPage
			}
		]),
		ReactiveComponentModule,
	],
})
export class OrderModule { }
