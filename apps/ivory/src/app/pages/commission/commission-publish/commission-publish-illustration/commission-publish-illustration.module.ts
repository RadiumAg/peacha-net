import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionPublishIllustrationComponent } from './commission-publish-illustration.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommissionApiService } from '../../service/commission-api.service';
import { ReactiveComponentModule } from '@peacha-core';
import { ComponentsModule } from '../../components/components.module';
import { PeachaComponentsModule } from '@peacha-core/components';

@NgModule({
  declarations: [CommissionPublishIllustrationComponent],
  imports: [
    CommonModule,
    PeachaComponentsModule,
    ReactiveFormsModule,
    ReactiveComponentModule,
    ComponentsModule,
    RouterModule.forChild([
      {
        path: '',
        component: CommissionPublishIllustrationComponent,
      },
    ]),
  ],
  providers: [CommissionApiService],
})
export class CommissionPublishIllustrationModule { }
