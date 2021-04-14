import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveComponentModule, RoleApiService } from '@peacha-core';
import { TradeApiService } from '../pay/trade-api.service';
import { OrderListPage } from './order-list/order-list.page';
import { PayRecordDetailPage } from './payrecord/pay-record-detail/pay-record-detail.page';
import { PayrecordPage } from './payrecord/payrecord.page';
import { SettingResolve } from './user-center.guard';
import { UserCenterPage } from './user-center.page';
import { UserProfilePage } from './user-profile/user-profile.page';
import { UserSecurityPage } from './user-security/user-security.page';
import { WalletPage } from './wallet/wallet.page';
import { MydatepickerPage } from './wallet/mydatepicker/mydatepicker.page';
import { WalletDrawPage } from './wallet/wallet-withdraw/walletdraw.page';
import { ComponentsModule } from '../commission/components/components.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { CouponPage } from './coupon/coupon.page';
import { BuyOrderDetailPage } from './buy-order-detail/buy-order-detail.page';
import { PeachaComponentsModule } from '@peacha-core/components';

@NgModule({
	declarations: [
		UserCenterPage,
		UserProfilePage,
		UserSecurityPage,
		WalletPage,
		WalletDrawPage,
		OrderListPage,
		BuyOrderDetailPage,
		MydatepickerPage,
		PayrecordPage,
		PayRecordDetailPage,
		CouponPage
	],
	imports: [
		ReactiveComponentModule,
		CommonModule,
		PeachaComponentsModule,
		FormsModule,
		ReactiveFormsModule,
		ComponentsModule,
		NzDatePickerModule,
		TranslateModule.forChild(),
		RouterModule.forChild([
			{
				path: '',
				component: UserCenterPage,
				canActivate: [SettingResolve],
				children: [
					{
						path: '',
						component: UserProfilePage,
					},
					{
						path: 'linkagetime',
						loadChildren: () => import('./prprlive-info/prprlive-info.module').then(m => m.PrprliveInfoModule),
					},
					{
						path: 'security',
						component: UserSecurityPage,
					},
					{
						path: 'wallet',
						component: WalletPage,
					},
					{
						path: 'wallet/:id',
						component: WalletDrawPage,
					},
					{
						path: 'order',
						component: OrderListPage,
					},
					{
						path: 'buy-order/:id',
						component: BuyOrderDetailPage,
					},
					{
						path: 'pay',
						component: PayrecordPage,
					},
					{
						path: 'pay/:payid',
						component: PayRecordDetailPage,
					},
					{
						path: 'coupon',
						component: CouponPage
					}
				],
			},
		]),
	],
	providers: [SettingResolve, TradeApiService, RoleApiService,],
})
export class UserCenterModule { }
