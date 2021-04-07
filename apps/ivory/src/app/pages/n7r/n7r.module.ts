import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { N7rApiService } from './n7r-api.service';
import { N7rPage } from './n7r.page';

@NgModule({
	declarations: [N7rPage],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: N7rPage,
			},
		]),
	],
	providers: [N7rApiService],
})
export class n7rModule {}
