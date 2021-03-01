import { UserLinkageRechargePage } from './user-linkage-recharge-page/user-linkage-recharge-page.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ReactiveComponentModule } from '@peacha-core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CdkExchangePage } from './cdk-exchange/cdk-exchange.component';
import { UserLinkageTimePage } from './user-linkage-time-page/user-linkage-time-page.component';
import { UserLinkageOrderPage } from './user-linkage-order-page/user-linkage-order-page.component';


@NgModule({
  declarations: [
     CdkExchangePage,
     UserLinkageTimePage,
     UserLinkageRechargePage,
     UserLinkageOrderPage],
  imports: [
    CommonModule,
    NzSpinModule,
    ReactiveComponentModule,
    TranslateModule.forChild(),
    RouterModule.forChild([{
      path:'',
      component: UserLinkageTimePage,
    },{
      path: 'recharge',
      component: UserLinkageRechargePage,
    },{
      path: 'order',
      component: UserLinkageOrderPage,
    },{
      path: 'cdk_exchange',
      component: CdkExchangePage,
    }
  ]),
  ],

})
export class PrprliveInfoModule { }
