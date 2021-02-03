import { FetchMe } from './state/user.action';
import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { NgxsModule, Store } from '@ngxs/store';
import { UserState } from './state/user.state';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastComponent } from './toast/toast.component';
import { Toast } from './toast/toast.service';
import { IvoryAPIInterceptor } from './interceptor/interceptor';
import { API_GATEWAY } from './tokens';
import { VerifycodeService } from './service/verifycode.service';
import { ModalService } from './service/modals.service';
import { CartState } from './state/cart.state';
import { DropDownService } from './service/dropdown.service';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { ZoomService } from './service/zoom.service';
import { ChatStartService } from './service/chat.service';
import { ChatState } from './state/chat.state';
import { CustomerService } from './service/customer.service';
import { Platform } from '@angular/cdk/platform';

export interface PeachaOptions {
  api_gateway: string;
}

export function appInitializer(store: Store, platform: Platform) {
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
      ],
    };
  }
}
