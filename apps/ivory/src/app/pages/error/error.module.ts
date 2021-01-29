import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundPage } from './not-found/not-found.page';
import { RouterModule } from '@angular/router';

@NgModule({
	declarations: [NotFoundPage],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '404',
				component: NotFoundPage,
			},
			{
				path: '**',
				component: NotFoundPage,
			},
		]),
	],
})
export class ErrorModule {}
