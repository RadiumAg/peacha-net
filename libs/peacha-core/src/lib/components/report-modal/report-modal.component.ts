import { ModalRef, ModalService } from './../../core/service/modals.service';
import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { MODAL_ANIMATION } from '../../core/animations/modal-animation';
import { validator } from '../../core/commom/common';
import { MODAL_DATA_TOKEN } from '../../core/tokens';
import { PopTips } from '../pop-tips/pop-tips';

@Component({
	selector: 'ivo-report-modal',
	templateUrl: './report-modal.component.html',
	styleUrls: ['./report-modal.component.less'],
	animations: [MODAL_ANIMATION],
})
export class ReportModalComponent {
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
		private modalRef: ModalRef<ReportModalComponent>,
		private cdRef: ChangeDetectorRef,
		private modal: ModalService,
		@Inject(MODAL_DATA_TOKEN)
		public id: number
	) {}

	form = this.fb.group({
		option: ['', Validators.required],
		text: ['', Validators.required],
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
				t: 1,
				o: this.id,
				d: this.form.value.option + ':' + this.form.value.text,
				i: this.form.value.pics.map(pic => pic.remote_token),
			})
			.pipe(take(1))
			.subscribe({
				next: _ => {
					this.modal
						.open(PopTips, ['举报成功', 0, 1])
						.afterClosed()
						.pipe(take(1))
						.subscribe(_ => {
							if (!!_) {
								this.modalRef.close();
							}
						});
				},
				error: _ => {
					this.modal
						.open(PopTips, ['举报失败', 1, 0])
						.afterClosed()
						.pipe(take(1))
						.subscribe(_ => {
							if (!!_) {
								this.modalRef.close();
							}
						});
				},
			});
	}
}
