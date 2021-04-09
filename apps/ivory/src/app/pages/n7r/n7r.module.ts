import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { N7rApiService } from './n7r-api.service';
import { N7rPage } from './n7r.page';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReactiveComponentModule } from '@peacha-core';
import { N7rNavbarComponent } from './components/n7r-navbar/navbar.component';
import { N7rPlay } from './components/play/play';
import { N7rGoodDetail } from './components/good-detail/good-detail';
import { PeachaComponentsModule } from '@peacha-core/components';
import { ReactiveFormsModule } from '@angular/forms';
import { AddressSelect } from './components/addressSelect/addressSelect';
import { N7rOrder } from './components/order/order';

@NgModule({
	declarations: [N7rPage, N7rNavbarComponent, N7rPlay, N7rGoodDetail, AddressSelect, N7rOrder],
	imports: [
		CommonModule,
		OverlayscrollbarsModule,
		OverlayModule,
		RouterModule,
		ReactiveComponentModule,
		PeachaComponentsModule,
		ReactiveFormsModule,
		RouterModule.forChild([
			{
				path: '',
				component: N7rPage,
			},
		]),
	],
	providers: [N7rApiService],
})
export class n7rModule { }
