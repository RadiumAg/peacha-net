import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { N7rApiService } from './n7r-api.service';
import { N7rPage } from './n7r.page';
import { OverlayscrollbarsModule } from 'overlayscrollbars-ngx';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReactiveComponentModule } from '@peacha-core';
import { N7rNavbarComponent } from './components/n7r-navbar/navbar.component';

@NgModule({
	declarations: [N7rPage, N7rNavbarComponent],
	imports: [
		CommonModule,
		OverlayscrollbarsModule,
		OverlayModule,
		RouterModule,
		ReactiveComponentModule,
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
