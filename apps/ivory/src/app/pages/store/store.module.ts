import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorePage } from './store.page';
import { ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule } from '@peacha-core';
import { PeachaComponentsModule } from '@peacha-core/components';

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
export class StoreModule { }
