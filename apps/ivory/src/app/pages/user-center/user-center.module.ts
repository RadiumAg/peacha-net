import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserCenterPage } from './user-center.page';
import { UserProfilePage } from './user-profile/user-profile.page';
import { UserSecurityPage } from './user-security/user-security.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WalletPage } from './wallet/wallet.page';
import { OrderListPage } from './order-list/order-list.page';
import { OrderDetailPage } from './order-detail/order-detail.page';
import { CdComponent } from './cd/cd.component';
import { SettingResolve } from './user-center.guard';
import { MydatepickerPage } from './wallet/mydatepicker/mydatepicker.page';
import { PayrecordPage } from './payrecord/payrecord.page';
import { PayRecordDetailPage } from './payrecord/pay-record-detail/pay-record-detail.page';
import { TradeApiService } from '../pay/trade-api.service';
import { WalletDrawPage } from './wallet/wallet-withdraw/walletdraw.page';
import {
  PeachaComponentsModule,
  ReactiveComponentModule,
  RoleApiService,
} from '@peacha-core';
import { ComponentsModule } from '../commission/components/components.module';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@NgModule({
  declarations: [
    UserCenterPage,
    UserProfilePage,
    UserSecurityPage,
    WalletPage,
    WalletDrawPage,
    OrderListPage,
    OrderDetailPage,
    CdComponent,
    OrderDetailPage,
    MydatepickerPage,
    PayrecordPage,
    PayRecordDetailPage,
  ],
  imports: [
    ReactiveComponentModule,
    CommonModule,
    PeachaComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    NzDatePickerModule,
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
            path: 'order/:id',
            component: OrderDetailPage,
          },
          {
            path: 'pay',
            component: PayrecordPage,
          },
          {
            path: 'pay/:payid',
            component: PayRecordDetailPage,
          },
        ],
      },
    ]),
  ],
  providers: [SettingResolve, TradeApiService, RoleApiService],
})
export class UserCenterModule {}
