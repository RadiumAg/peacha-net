import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorePage } from './store.page';
import { ReactiveFormsModule } from '@angular/forms';
import { PeachaComponentsModule, ReactiveComponentModule } from '@peacha-core';

@NgModule({
  declarations: [StorePage],
  imports: [
    ReactiveFormsModule,
    PeachaComponentsModule,
    ReactiveComponentModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: StorePage,
      },
    ]),
  ],
})
export class StoreModule {}
