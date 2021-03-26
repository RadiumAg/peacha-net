import { ThreeModelPaidComponent } from './3dModel/3dModel-paid/3dModel-paid.component';
import { ThreeModelOnlyShowComponent } from './3dModel/3dModel-only-show/3dModel-only-showcomponent';
import { ThreeModelFreeComponent } from './3dModel/3dModel-free/3dModel-free.component';
import { ThreeDModelSelectComponent } from './select-type/3dModel/3dmodel.component';
import { app_config } from './../../../global.config';
import { Live2dFreeComponent } from './live2d/live2d-free/live2d-free.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { Live2dorillustComponent } from './select-type/live2dorillust/live2dorillust.component';
import { FooterComponent } from './select-type/components/footer/footer.component';
import { HeaderComponent } from './select-type/components/header/header.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoseComponent } from './select-type/chose.component';
import { Live2dFreeOrPaidComponent } from './select-type/live2d/live2d.component';
import { ReleaseComponentsModule } from './components/component.module';
import { Live2dPaidComponent } from './live2d/live2d-paid/live2d-paid.component';
import { NotFoundPage } from '../error/not-found/not-found.page';
import { ReleaseApiService } from './release-api.service';
import { FORM_NAV_TOKEN,PhoneGuard,SELECT_DATA_TOKEN,SELECT_TOKEN,UserBanStatusGuard } from '@peacha-core';
import { PeachaStudioCoreModule } from '@peacha-studio-core';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { PeachaComponentsModule } from '@peacha-core/components';
import { CompressService } from '@peacha-studio-core/zip';
import { IllustrateFreeComponent } from './illustrate/illustrate-free/illustrate-free.component';
import { IllustratePaidComponent } from './illustrate/illustrate-paid/illustrate-paid.component';
import { illustratePaidOrFreeComponent } from './select-type/illustrate/illustratePaidOrFreeComponent.component';

@NgModule({
  declarations: [
    ThreeDModelSelectComponent,
    ChoseComponent,
    HeaderComponent,
    FooterComponent,
    Live2dorillustComponent,
    Live2dFreeOrPaidComponent,
    Live2dFreeComponent,
    Live2dPaidComponent,
    IllustrateFreeComponent,
    IllustratePaidComponent,
    illustratePaidOrFreeComponent,
    ThreeModelFreeComponent,
    ThreeModelOnlyShowComponent,
    ThreeModelPaidComponent,
  ],
  imports: [
    CommonModule,
    PeachaComponentsModule,
    PeachaStudioCoreModule,
    ReleaseComponentsModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzRadioModule,
    NzFormModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ChoseComponent,
        canActivate: [UserBanStatusGuard],
        children: [
          {
            path: '',
            component: Live2dorillustComponent,
          },
          {
            path: '3d',
            component: ThreeDModelSelectComponent
          },
          {
            path: 'live2d',
            component: Live2dFreeOrPaidComponent,
          },
          {
            path: 'illust',
            component: illustratePaidOrFreeComponent
          }
        ],
      },
      {
        path: 'live2d/free',
        component: Live2dFreeComponent,
        canActivate: [PhoneGuard,UserBanStatusGuard],
      },
      {
        path: 'live2d/paid',
        component: app_config.enablePaid ? Live2dPaidComponent : NotFoundPage,
        canActivate: [PhoneGuard,UserBanStatusGuard],
      },
      {
        path: 'illust/free',
        component: IllustrateFreeComponent,
        canActivate: [PhoneGuard,UserBanStatusGuard]
      },
      {
        path: 'illust/paid',
        component: IllustratePaidComponent,
        canActivate: [PhoneGuard,UserBanStatusGuard]
      },
      {
        path: '3d/free',
        component: ThreeModelFreeComponent,
        canActivate: [PhoneGuard,UserBanStatusGuard]
      },
      {
        path: '3d/onlyShow',
        component: ThreeModelOnlyShowComponent,
        canActivate: [PhoneGuard,UserBanStatusGuard]
      },
      {
        path: '3d/paid',
        component: ThreeModelPaidComponent,
        canActivate: [PhoneGuard,UserBanStatusGuard]
      }
    ]),
  ],
  providers: [
    ReleaseApiService,
    CompressService,
    {
      provide: SELECT_TOKEN,
      useValue: new BehaviorSubject(true),
      multi: false,
    },
    {
      provide: SELECT_DATA_TOKEN,
      useValue: new BehaviorSubject<{
        header_title: string[];
        next: string;
        pre: string;
      }>({
        header_title: null,
        next: 'live2d',
        pre: '',
      }),
    },
    {
      provide: FORM_NAV_TOKEN,
      useValue: new BehaviorSubject([]),
    },
  ],
})
export class ReleaseModule { }
