import { ModalRef, ModalService } from './../../core/service/modals.service';
import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl } from '@angular/forms';
import { take, tap } from 'rxjs/operators';
import { PopTips } from '../pop-tips/pop-tips';
import { MODAL_ANIMATION } from '../../core/animations/modal-animation';
import { validator } from '../../core/commom/common';
import { MODAL_DATA_TOKEN } from '../../core/tokens';

@Component({
	selector: 'ivo-report-modal',
	templateUrl: './user-report-modal.component.html',
	styleUrls: ['./user-report-modal.component.less'],
	animations: [MODAL_ANIMATION],
})
export class UserReportModalComponent {
	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private modalRef: ModalRef<UserReportModalComponent>,
		private cdRef: ChangeDetectorRef,
		private modal: ModalService,
		@Inject(MODAL_DATA_TOKEN)
		public id: number
	) {}

	form = this.fb.group({
		option: [
			[
				{ label: '头像违规', value: '头像违规' },
				{ label: '昵称违规', value: '昵称违规' },
				{ label: '签名违规', value: '签名违规' },
				{ label: '背景图违规', value: '背景图违规' },
			],
			(control: FormControl): { [s: string]: boolean } => {
				if (control.value.filter(o => o.checked).length > 0) {
					return {};
				} else {
					return {
						error: true,
					};
				}
			},
		],
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
				t: 0,
				o: this.id,
				d: this.form.value.option
					.filter(o => o.checked)
					.map(o => o.value)
					.join(','),
				i: [],
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
