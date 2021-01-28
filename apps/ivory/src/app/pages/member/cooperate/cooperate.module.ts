import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CooperateWorkPage } from './cooperate-work/cooperate-work.page';
import { CooperateDetailPage } from './cooperate-detail/cooperate-detail.page';
import { CooperatePage } from './cooperate.page';
import { ModifyScale } from './cooperate-detail/modify-scale/modify-scale';
import { PeachaComponentsModule, ReactiveComponentModule } from '@peacha-core';

@NgModule({
  declarations: [
    CooperateWorkPage,
    CooperateDetailPage,
    ModifyScale,
    CooperatePage,
  ],
  imports: [
    ReactiveFormsModule,
    PeachaComponentsModule,
    CommonModule,
    ReactiveComponentModule,
    RouterModule.forChild([
      {
        path: '',
        // pathMatch: 'full',
        component: CooperatePage,
        children: [
          {
            path: '',
            component: CooperateWorkPage,
          },
          {
            path: 'detail',
            component: CooperateDetailPage,
          },
        ],
      },
    ]),
  ],
})
export class CooperateModule {}
