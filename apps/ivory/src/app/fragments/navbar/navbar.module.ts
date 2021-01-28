import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarFragment } from './navbar.fragment';
import { OverlayModule } from '@angular/cdk/overlay';
import { RouterModule } from '@angular/router';
import { PeachaComponentsModule } from '@peacha-core';

@NgModule({
  declarations: [NavbarFragment],
  imports: [CommonModule, OverlayModule, RouterModule, PeachaComponentsModule],
  exports: [NavbarFragment],
})
export class NavbarModule {}
