import { SubcommentPagination } from './subcomment-pagination/subcomment-pagination';
import { CommentReportModalComponent } from './comment-report-modal/comment-report-modal-component';
import { UserReportModalComponent } from './user-report-modal/user-report-modal.component';
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
import { PopTips } from './pop-tips/pop-tips';
import { PaginationComponent } from './pagination/pagination.component';
import { Select } from './select/select';
import { Option } from './option/option';
import { OverlayModule } from '@angular/cdk/overlay';
import { CropBanner } from './crop-banner/crop-banner';
import { ReportModalComponent } from './report-modal/report-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { LackImage } from './lack-image/lack-image';
import { ReportUploadComponent } from './report-modal/report-upload/report-upload.component';
import { IngredientComponent } from './ingredient/ingredient.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { LazyImgComponent } from './lazy-img/lazy-img.component';
import { ImageShadowDirective } from './image-shadow/image-shadow.directive';
import { CursorComponent } from './cursor/cursor.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { WorkCard } from './work-card/work-card';
import { ErroTipDirective } from './erro-tip.directive';
import { RouterModule } from '@angular/router';
import { IllustrateUploadComponent } from './illustrate-upload/illustrate-upload.component';
import { UploadComponent } from './upload/upload.component';
import { ErroTipDirectiveTwo } from './erro-tip.directive-type-two';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DebounceClickDirective } from './debounce-click.directive';
import { WorkSelectorComponent } from './work-selector/work-selector.component';
import { UploadImageDirective } from './uploadImage/uploadImage.directive';
import { ChangeUnitPipe } from './pipes/change-unit.pipe';
import { MydatePipe } from './pipes/mydate.pipe';
import { TimerDatePipe } from './pipes/timer-date.pipe';
import { IvoNameFriendlyPipe } from './upload/app-name-friendly.pipe';

@NgModule({
	declarations: [
		ErrorDisplay,
		ErrorDisplayCase,
		Button,
		Steps,
		Step,
		StepJump,
		Cropper,
		CropImage,
		PaginationComponent,
		MydatePipe,
		PopTips,
		ChangeUnitPipe,
		Select,
		Option,
		CropBanner,
		SubcommentPagination,
		ReportModalComponent,
		UserReportModalComponent,
		CommentReportModalComponent,
		LackImage,
		ReportUploadComponent,
		TimerDatePipe,
		IngredientComponent,
		LazyImgComponent,
		ImageShadowDirective,
		CursorComponent,
		VideoPlayerComponent,
		WorkCard,
		ErroTipDirective,
		IllustrateUploadComponent,
		UploadComponent,
		ErroTipDirectiveTwo,
		CheckboxComponent,
		DebounceClickDirective,
		WorkSelectorComponent,
		UploadImageDirective,
		IvoNameFriendlyPipe
	],
	exports: [
		ErrorDisplay,
		ErrorDisplayCase,
		Button,
		Steps,
		Step,
		StepJump,
		Cropper,
		CropImage,
		PaginationComponent,
		MydatePipe,
		PopTips,
		ChangeUnitPipe,
		Select,
		Option,
		CropBanner,
		SubcommentPagination,
		LackImage,
		TimerDatePipe,
		IngredientComponent,
		LazyImgComponent,
		ImageShadowDirective,
		CursorComponent,
		LazyLoadImageModule,
		VideoPlayerComponent,
		WorkCard,
		ErroTipDirective,
		IllustrateUploadComponent,
		UploadComponent,
		ErroTipDirectiveTwo,
		CheckboxComponent,
		DebounceClickDirective,
		WorkSelectorComponent,
		UploadImageDirective,
		IvoNameFriendlyPipe
	],
	imports: [
		CommonModule,
		ImageCropperModule,
		ReactiveComponentModule,
		NzInputModule,
		OverlayModule,
		ReactiveFormsModule,
		NzFormModule,
		NzInputModule,
		NzRadioModule,
		NzCheckboxModule,
		FormsModule,
		LazyLoadImageModule,
		NzMessageModule,
		RouterModule,
	],
})
export class PeachaComponentsModule { }
