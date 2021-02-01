import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicityComponent } from './publicity.component';

@NgModule({
    declarations: [PublicityComponent],
    imports: [CommonModule, ComponentsModule, TranslateModule.forChild()],
})
export class PublicityModule {}
