import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WalletPayPage } from './wallet-pay/wallet-pay.page';
import { WalletBindPage } from './wallet-bind/wallet-bind.page';
import { WalletWithdrawPage } from './wallet-withdraw/wallet-withdraw.page';
import { SubmitSuccess } from './wallet-withdraw/submit-success/submit-success';
import { ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';
@NgModule({
	declarations: [WalletPayPage, WalletBindPage, WalletWithdrawPage, SubmitSuccess],
	imports: [
		FormsModule,
		ReactiveFormsModule,
		PeachaComponentsModule,
		ReactiveComponentModule,
		CommonModule,
		RouterModule.forChild([
			{
				path: 'pay',
				component: WalletPayPage,
			},
			{
				path: 'bind',
				component: WalletBindPage,
			},
			{
				path: 'withdraw',
				component: WalletWithdrawPage,
			},
		]),
	],
})
export class WalletModule { }
