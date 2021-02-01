import { NgModule } from '@angular/core';
import { AdditionalGoodsComponent } from './additional-goods.component';
import { AdditionalComponent } from './additional/additional.component';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload/upload.component';
import { IvoNameFriendlyPipe } from './app-name-friendly.pipe';
import { IvoSetInputworldDirective } from './ivo-set-inputworld.directive';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzCheckboxModule, NzRadioModule, NgZorroAntdModule } from 'ng-zorro-antd';
import { ReactiveComponentModule } from 'src/app/core/reactive';

@NgModule({
    declarations: [
        AdditionalGoodsComponent,
        AdditionalComponent,
        UploadComponent,
        IvoNameFriendlyPipe,
        IvoSetInputworldDirective,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NzRadioModule,
        NzCheckboxModule,
        ReactiveComponentModule,
    ],
    exports: [AdditionalGoodsComponent],
})
export class AdditionalGoodsModule {}
