import { Platform } from '@angular/cdk/platform';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER,ModuleWithProviders,NgModule } from '@angular/core';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule,Store } from '@ngxs/store';
import { IvoryAPIInterceptor } from './interceptor/interceptor';
import { VerifycodeService } from './service/verifycode.service';
import { ZoomService } from './service/zoom.service';
import { CartState } from './state/cart.state';
import { FetchMe } from './state/user.action';
import { ToastComponent } from './toast/toast.component';
import { Toast } from './toast/toast.service';
import { API_GATEWAY } from './tokens';
import { DropDownService } from './service/dropdown.service';
import { ChatStartService } from './service/chat.service';
import { CustomerService } from './service/customer.service';
import { ChatState, UserState } from './state';
import { MessageUnreadCountService, ModalService, ShopMallApiService } from './service';


export interface PeachaOptions {
  api_gateway: string;
}

export function appInitializer(store: Store, platform: Platform,) {
  const isMobile = platform.ANDROID || platform.IOS;
  if (isMobile) {
    location.href = 'https://m.peacha.net' + location.pathname;
  }
  return () => store.dispatch(new FetchMe()).toPromise();
}

@NgModule({
  declarations: [ToastComponent],
  imports: [
    HttpClientModule,
    NgxsModule.forFeature([UserState, CartState, ChatState]),
    NgxsStoragePluginModule.forRoot({
      key: ['cart'],
    }),
  ],
  exports: [HttpClientModule],
})
export class PeachaCoreModule {

  static forRoot(options: PeachaOptions): ModuleWithProviders<PeachaCoreModule> {
    return {
      ngModule: PeachaCoreModule,
      providers: [
        Toast,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: IvoryAPIInterceptor,
          multi: true,
        },
        {
          provide: API_GATEWAY,
          useValue: options.api_gateway,
        },
        {
          provide: APP_INITIALIZER,
          useFactory: appInitializer,
          deps: [Store, Platform],
          multi: true,
        },
        VerifycodeService,
        ModalService,
        DropDownService,
        ZoomService,
        ChatStartService,
        CustomerService,
        MessageUnreadCountService,
        ShopMallApiService
      ],
    };
  }
}
