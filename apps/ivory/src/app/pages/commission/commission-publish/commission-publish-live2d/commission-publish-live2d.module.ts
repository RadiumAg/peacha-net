import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommissionPublishLive2dComponent } from './commission-publish-live2d.component';
import { CommissionApiService } from '../../service/commission-api.service';
import { PeachaComponentsModule, ReactiveComponentModule } from '@peacha-core';

@NgModule({
	declarations: [CommissionPublishLive2dComponent],
	imports: [
		CommonModule,
		ReactiveComponentModule,
		ReactiveFormsModule,
		PeachaComponentsModule,
		RouterModule.forChild([
			{
				path: '',
				component: CommissionPublishLive2dComponent,
			},
		]),
	],
	providers: [CommissionApiService],
})
export class CommissionPublishLive2dModule {}
