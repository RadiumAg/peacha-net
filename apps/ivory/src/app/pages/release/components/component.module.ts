import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagInputComponent } from './tag-input/tag-input.component';
import { Live2dUploadComponent } from './live2d-upload/live2d-upload.component';
import { SelectCompanyComponent } from './select-company/select-company.component';
import { CompanyModalComponent } from './company-modal/company-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuccessTips } from './success-tips/success-tips';
import { NoticeTitleDirective } from './notice-title.directive';
import { FormNavComponent } from './form-nav/form-nav.component';
import { FormNavDirective } from './form-nav.directive';
import { ThumbnailUploadComponent } from './thumbnail-upload/thumbnail-upload.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PeachaComponentsModule, ReactiveComponentModule } from '@peacha-core';
import { PeachaStudioCoreModule } from '@peacha-studio-core';
import { NzFormModule } from 'ng-zorro-antd/form';

@NgModule({
  declarations: [
    ThumbnailUploadComponent,
    TagInputComponent,
    Live2dUploadComponent,
    SelectCompanyComponent,
    CompanyModalComponent,
    SuccessTips,
    NoticeTitleDirective,
    FormNavComponent,
    FormNavDirective,
  ],
  imports: [
    CommonModule,
    NzButtonModule,
    PeachaComponentsModule,
    PeachaStudioCoreModule,
    ReactiveComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    FormsModule,
    NzRadioModule,
    NzCheckboxModule,
  ],
  exports: [
    ThumbnailUploadComponent,
    TagInputComponent,
    Live2dUploadComponent,
    SelectCompanyComponent,
    CompanyModalComponent,
    NoticeTitleDirective,
    FormNavComponent,
    FormNavDirective,
  ],
})
export class ReleaseComponentsModule {}
