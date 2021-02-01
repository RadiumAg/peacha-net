import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { ErrorDisplay } from './error-display/error-display';
import { ErrorDisplayCase } from './error-display/error-display-case';
import { Button } from './button/button';
import { Steps } from './steps/steps';
import { Step } from './steps/step';
import { StepJump } from './steps/step-jump';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Cropper } from './cropper/cropper';
import { CropImage } from './cropper/cropper.component';
import { ReactiveComponentModule } from '../core/reactive';
import { Page } from './page/page';
import { Carousel } from './carousel/carousel';
import { IvoInput } from './input/input';
import { MydatePipe } from './mydate.pipe';
import { MyselectComponent } from './myselect/myselect.component';
import { PopTips } from './pop-tips/pop-tips';
import { ChangeUnitPipe } from './change-unit/change-unit.pipe';
import { Select } from './select/select';
import { Option } from './option/option';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopTip } from './pop-tip/pop-tip';
import { CropBanner } from './crop-banner/crop-banner';
import { SavePipe } from './save.pipe';
import { AdditionalGoodsModule } from './additional-goods/additional-goods.module';
import { Pagination } from './pagination/pagination';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LackImage } from './lack-image/lack-image';
import { TimerDatePipe } from './timer-date.pipe';
import { IngredientComponent } from './ingredient/ingredient.component';
import { DefaultImageComponent } from './default-image/default-image.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LazyImgComponent } from './lazy-img/lazy-img.component';
import { ImageShadowDirective } from './image-shadow/image-shadow.directive';
import { CursorComponent } from './cursor/cursor.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { TimeFormatPipe } from './time-format.pipe';


@NgModule({
    declarations: [
        ErrorDisplay,
        ErrorDisplayCase,
        Button,
        IvoInput,
        Steps,
        Step,
        StepJump,
        Cropper,
        CropImage,
        Page,
        Carousel,
        MydatePipe,
        MyselectComponent,
        PopTips,
        ChangeUnitPipe,
        PopTip,
        Select,
        Option,
        CropBanner,
        SavePipe,
        Pagination,
        LackImage,
        TimerDatePipe,
        IngredientComponent,
        DefaultImageComponent,
        LazyImgComponent,
        ImageShadowDirective,
        CursorComponent,
        VideoPlayerComponent,
        TimeFormatPipe,
    ],
    exports: [
        ErrorDisplay,
        ErrorDisplayCase,
        Button,
        IvoInput,
        Steps,
        Step,
        StepJump,
        Cropper,
        CropImage,
        Page,
        Carousel,
        MydatePipe,
        MyselectComponent,
        PopTips,
        ChangeUnitPipe,
        PopTip,
        Select,
        Option,
        CropBanner,
        SavePipe,
        AdditionalGoodsModule,
        Pagination,
        LackImage,
        TimerDatePipe,
        IngredientComponent,
        DefaultImageComponent,
        LazyImgComponent,
        ImageShadowDirective,
        CursorComponent,
        LazyLoadImageModule,
        VideoPlayerComponent,
        TimeFormatPipe,
    ],
    imports: [
        CommonModule,
        ImageCropperModule,
        ReactiveComponentModule,
        NzInputModule,
        OverlayModule,
        AdditionalGoodsModule,
        ReactiveFormsModule,
        NzFormModule,
        NzInputModule,
        NzRadioModule,
        NzCheckboxModule,
        FormsModule,
        LazyLoadImageModule,
        TranslateModule.forChild()
    ],
})
export class ComponentsModule { }
