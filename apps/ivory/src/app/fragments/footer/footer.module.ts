import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { FooterFragment } from './footer.fragment';

@NgModule({
	declarations: [FooterFragment],
	imports: [CommonModule, OverlayModule, RouterModule],
	exports: [FooterFragment],
})
export class FooterModule {}
