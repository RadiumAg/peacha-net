import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReactiveComponentModule } from '@peacha-core';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserCenterPage } from './user-center.page';
import { UserProfilePage } from './user-profile/user-profile.page';
import { UserSecurityPage } from './user-security/user-security.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserResetPage } from './user-reset/user-reset.page';
import { WalletPage } from './wallet/wallet.page';
import { OrderListPage } from './order-list/order-list.page';
import { CdComponent } from './cd/cd.component';
import { WalletIncomeDatailPage } from './wallet-income-datail/wallet-income-datail.page';
import { WalletRefundDatailPage } from './wallet-refund-datail/wallet-refund-datail.page';
import { WalletRechargeDetailPage } from './wallet-recharge-detail/wallet-recharge-detail.page';
import { WalletPayDetailPage } from './wallet-pay-detail/wallet-pay-detail.page';
import { WalletCashoutDetailPage } from './wallet-cashout-detail/wallet-cashout-detail.page';
import { UserLinkageTimePageComponent } from './user-linkage-time-page/user-linkage-time-page.component';
import { UserLinkageRechargePageComponent } from './user-linkage-recharge-page/user-linkage-recharge-page.component';
import { UserLinkageOrderPageComponent } from './user-linkage-order-page/user-linkage-order-page.component';
import { CdkExchangeComponent } from './cdk-exchange/cdk-exchange.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@NgModule({
    declarations: [
        UserCenterPage,
        UserProfilePage,
        UserSecurityPage,
        UserResetPage,
        WalletPage,
        OrderListPage,
        CdComponent,
        WalletRechargeDetailPage,
        WalletCashoutDetailPage,
        WalletIncomeDatailPage,
        WalletRefundDatailPage,
        WalletPayDetailPage,
        UserLinkageTimePageComponent,
        UserLinkageRechargePageComponent,
        UserLinkageOrderPageComponent,
        CdkExchangeComponent
    ],
    imports: [
        NzSpinModule,
        ReactiveComponentModule,
        CommonModule,
        ComponentsModule,
        FormsModule,
        ReactiveFormsModule,
        ComponentsModule,
        NzDatePickerModule,
        NzIconModule,
        RouterModule.forChild([
            {
                path: '',
                component: UserCenterPage,
                children: [
                    {
                        path: '',
                        component: UserLinkageTimePageComponent,
                    },
                    {
                        path: 'profile',
                        component: UserProfilePage,
                    },
                    {
                        path: 'security',
                        component: UserSecurityPage,
                    },
                    {
                        path: 'security/reset_password',
                        component: UserResetPage,
                    },
                    {
                        path: 'cdk_exchange',
                        component: CdkExchangeComponent,
                    },
                    {
                        path: 'recharge',
                        component: UserLinkageRechargePageComponent,
                    },
                    {
                        path: 'order',
                        component: UserLinkageOrderPageComponent,
                    }
                ],
            },
        ]),
        TranslateModule.forChild()
    ]
})
export class UserCenterModule { }
