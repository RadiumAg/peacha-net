import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Live2dPreviewComponent } from './components/live2d-preview/live2d-preview.component';
import { AnimationPanelComponent } from './components/live2d-preview/animation-panel/animation-panel.component';
import { SliderComponent } from './components/live2d-preview/setting-panel/slider/slider.component';
import { SettingPanelComponent } from './components/live2d-preview/setting-panel/setting-panel.component';
import { ReactiveComponentModule } from '@peacha-core';
import { Live2dPreviewMinComponent } from './components/live2d-preview-min/live2d-preview-min.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ReactiveComponentModule, ReactiveFormsModule],
  declarations: [
    Live2dPreviewComponent,
    Live2dPreviewMinComponent,
    AnimationPanelComponent,
    SliderComponent,
    SettingPanelComponent,
  ],
  exports: [Live2dPreviewComponent, Live2dPreviewMinComponent],
})
export class PeachaStudioCoreModule {}
