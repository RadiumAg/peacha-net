import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommissionNodeComponent } from './commission-node/commission-node.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReactiveComponentModule } from '@peacha-core';

@NgModule({
	declarations: [CommissionNodeComponent],
	imports: [CommonModule, ReactiveFormsModule, ReactiveComponentModule, FormsModule],
	exports: [CommissionNodeComponent],
})
export class ComponentsModule {}
