import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { NgxsModule, Store } from '@ngxs/store';
import { UserState } from './state/user.state';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastComponent } from './toast/toast.component';
import { Toast } from './toast/toast.service';
import { IvoryAPIInterceptor } from './interceptor/interceptor';
import { API_GATEWAY } from './tokens';
import { FetchMe } from './state/user.action';
import { VerifycodeService } from './service/verifycode.service';
import { ModalService } from './service/modals.service';
import { CartState } from './state/cart.state';
import { DropDownService } from './service/dropdown.service';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { ZoomService } from './service/zoom.service';
import { DialogStartService } from './service/dialog.service';
import { DialogState } from './state/dialog.state';
import { ApiSrevice } from './service/api.service';
import { CustomerService } from './service/customer.service';


export interface PeachaOptions{
    api_gateway: string;
}

export function appInitializer(store: Store){
    return () => store.dispatch(new FetchMe()).toPromise();
}

@NgModule({
    declarations: [
        ToastComponent
    ],
    imports: [
        HttpClientModule,
        NgxsModule.forFeature([UserState, CartState ,DialogState]),
        NgxsStoragePluginModule.forRoot({
            key: ['cart']
        })
    ],
    exports: [
        HttpClientModule
    ]
})
export class PeachaCoreModule {
    static forRoot(): ModuleWithProviders<PeachaCoreModule> {
        return {
            ngModule: PeachaCoreModule,
            providers: [
                Toast,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: IvoryAPIInterceptor,
                    multi: true
                },{
                    provide: APP_INITIALIZER,
                    useFactory: appInitializer,
                    deps: [Store],
                    multi: true
                },
                VerifycodeService,
                ModalService,
                ApiSrevice,
                DropDownService,
                ZoomService,
                DialogStartService,
                CustomerService
            ]
        };
    }
}
