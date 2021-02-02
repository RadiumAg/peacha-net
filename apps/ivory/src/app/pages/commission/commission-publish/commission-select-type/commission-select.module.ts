import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionSelect } from './commission-select/commission-select.component';
import { BehaviorSubject } from 'rxjs';
import { CommissionChoseComponent } from './commission-chose.component';
import { HeaderComponent } from './commission-components/header/header.component';
import { FooterComponent } from './commission-components/footer/footer.component';
import { FORM_NAV_TOKEN, ReactiveComponentModule, SELECT_DATA_TOKEN, SELECT_TOKEN } from '@peacha-core';


@NgModule({
	declarations: [CommissionSelect, HeaderComponent, FooterComponent, CommissionChoseComponent],
	imports: [
		CommonModule,
		ReactiveComponentModule,
		RouterModule.forChild([
			{
				path: '',
				component: CommissionChoseComponent,
				children: [
					{
						path: '',
						component: CommissionSelect,
					},
				],
			},
		]),
	],
	providers: [
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
export class CommissionSelectModule { }
