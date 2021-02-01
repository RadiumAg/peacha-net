import { ModalRef, ModalService } from './../../core/service/modals.service';
import { Component, Inject, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { PopTips } from '../pop-tips/pop-tips';
import { MODAL_ANIMATION } from '../../core/animations/modal-animation';
import { MODAL_DATA_TOKEN } from '../../core/tokens';
import { validator } from '../../core/commom/common';

@Component({
	selector: 'ivo-report-modal',
	templateUrl: './comment-report-modal-component.html',
	styleUrls: ['./comment-report-modal-component.less'],
	animations: [MODAL_ANIMATION],
})
export class CommentReportModalComponent implements AfterContentChecked {
	options$ = new BehaviorSubject<string[]>([
		'违法违禁',
		'色情',
		'低俗',
		'赌博诈骗',
		'人身攻击',
		'侵犯隐私',
		'垃圾广告',
		'引战',
		'刷屏',
		'内容不相关',
		'青少年不良信息',
		'其他',
	]);
	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private modalRef: ModalRef<CommentReportModalComponent>,
		private cdRef: ChangeDetectorRef,
		private modal: ModalService,
		@Inject(MODAL_DATA_TOKEN)
		public id: number
	) { }

	otherChecked$ = new BehaviorSubject(false);

	form = this.fb.group({
		option: [
			'',
			[
				Validators.required,
				(control: FormControl): { [s: string]: boolean } => {
					if (control.value === '其他') {
						this.otherChecked$.next(true);
					} else {
						this.otherChecked$.next(false);
					}
					return {};
				},
			],
		],
		text: [
			'',
			[
				(control: FormControl): { [s: string]: boolean } => {
					if (control.value.length > 0 || !this.otherChecked$.value) {
						return {};
					} else {
						return {
							error: true,
						};
					}
				},
			],
		],
		pics: [[]],
	});

	ngAfterContentChecked(): void {
		this.cdRef.detectChanges();
	}

	cancel() {
		this.modalRef.cancel();
	}

	report() {
		validator(this.form, this.form.controls);
		if (!this.form.valid) {
			return;
		}
		this.http
			.post('/user/report', {
				t: 3,
				o: this.id,
				d: this.form.value.option + (this.form.value.text.length > 0 ? ':' + this.form.value.text : ''),
				i: this.form.value.pics.map(pic => pic.remote_token),
			})
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.modal
						.open(PopTips, ['举报成功', 0, 1])
						.afterClosed()
						.pipe(take(1))
						.subscribe(_ => {
							// eslint-disable-next-line no-extra-boolean-cast
							if (!!_) {
								this.modalRef.close();
							}
						});
				},
				error: () => {
					this.modal
						.open(PopTips, ['举报失败', 1, 0])
						.afterClosed()
						.pipe(take(1))
						.subscribe(_ => {
							// eslint-disable-next-line no-extra-boolean-cast
							if (!!_) {
								this.modalRef.close();
							}
						});
				},
			});
	}
}
