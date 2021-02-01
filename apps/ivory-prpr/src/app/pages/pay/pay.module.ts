import { PeachaComponentsModule, ReactiveComponentModule } from '@peacha-core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayPage } from './pay.page';
import { RouterModule } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { OverlayModule } from '@angular/cdk/overlay';
import { PurchaseResultsPage } from './purchase-results/purchase-results.page';
import { NoResult } from './purchase-results/no-result/no-resule';
import { PaySuccessPage } from './pay-success/pay-success.page';
import { TradeApiService } from './trade-api.service';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    declarations: [PayPage, PurchaseResultsPage, NoResult, PaySuccessPage],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: PayPage
            }, {
                path: 'results',
                component: PurchaseResultsPage
            }, {
                path: 'success',
                component: PaySuccessPage
            }
        ]),
        PeachaComponentsModule,
        TranslateModule.forChild(),
        ReactiveComponentModule,
        QRCodeModule,
        OverlayModule,
    ],
    providers: [
        TradeApiService
    ]
})
export class PayModule { }
