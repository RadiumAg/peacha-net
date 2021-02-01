import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicityComponent } from './publicity.component';
import { PeachaComponentsModule } from 'libs/peacha-core/src/lib/components';

@NgModule({
    declarations: [PublicityComponent],
    imports: [CommonModule, PeachaComponentsModule, TranslateModule.forChild()],
})
export class PublicityModule { }
