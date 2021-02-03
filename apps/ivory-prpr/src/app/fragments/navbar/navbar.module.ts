import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarFragment } from './navbar.fragment';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PeachaComponentsModule } from 'libs/peacha-core/src/lib/components/peacha-components.module';


@NgModule({
  declarations: [NavbarFragment],
  imports: [
    CommonModule,
    OverlayModule,
    RouterModule,
    PeachaComponentsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, './assets/i18n/', '.json')
        },
        deps: [HttpClient]
      }
    })
  ],
  exports: [
    NavbarFragment
  ]
})
export class NavbarModule { }