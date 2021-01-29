import { Component, Inject, OnInit } from '@angular/core';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';
import { CommissionDetail } from '../../../model/commission-detail';
import { CommissionApiService } from '../../../service/commission-api.service';
import { CommissionDetailService } from '../../../service/detail.service';
import { CommissionDetailErrorService } from '../../commission-detail-error.service';

@Component({
	selector: 'ivo-commission-timeout',
	templateUrl: './commission-timeout.html',
	styleUrls: ['./commission-timeout.less'],
	providers: [CommissionApiService, CommissionDetailErrorService, CommissionDetailService],
})
export class CommissionTimeout implements OnInit {
	tips: string;
	rate: number;
	isDiscontinue = false;

	constructor(
		private modalRef: ModalRef<CommissionTimeout>,
		@Inject(MODAL_DATA_TOKEN)
		public key: {
			type: number;
			id?: number;
			identity?: number;
			isSponsorTimeout?: boolean;
			detail?: CommissionDetail;
			rate?: number;
		},
		private api: CommissionApiService,
		private isError: CommissionDetailErrorService
	) {}

	ngOnInit(): void {
		if (this.key.type === -1) {
			this.tips = '';
		} else {
			if (this.key.identity === 1) {
				// 判断画师是否超时
				if (
					new Date().getTime() - this.key.detail.commission.startTime >
					(this.key.detail.commission.day + 7) * 24 * 60 * 60 * 1000
				) {
					if (this.key.detail.commission.category === 0) {
						this.tips = '模型师已超时超过7天，可主动发起超时中止。';
						this.isDiscontinue = true;
					} else {
						this.tips = '画师已超时超过7天，可主动发起超时中止。';
						this.isDiscontinue = true;
					}

					// this.rate = Number(this.key.rate ?? 0) * 100;
				} else {
					if (this.key.detail.commission.category === 0) {
						this.tips = '模型师超时未超时超过7天，不可发起超时中止。';
						this.isDiscontinue = false;
					} else {
						this.tips = '画师超时未超时超过7天，不可发起超时中止。';
						this.isDiscontinue = false;
					}
				}
			} else {
				// 判断企划方是否超时
				const i = this.key?.detail?.nodeList.filter(l => l.status === 1 && l.type === 2);
				let submit: number;

				if (i) {
					this.api.nodeSubmitRecords(i[0].id).subscribe(s => {
						submit = Number(s.list[0]?.submitTime);

						if (submit) {
							if (this.key.detail.commission.day > 10) {
								if (new Date().getTime() - submit > 5 * 24 * 60 * 60 * 1000) {
									this.tips = '企划方已超时超过5天，可主动发起超时中止。';
									this.isDiscontinue = true;
									this.rate = Number(this.key.rate ?? 0) * 100;
								} else {
									this.tips = '企划方超时未超时超过5天，不可发起超时中止。';
									this.isDiscontinue = false;
								}
							} else {
								if (new Date().getTime() - submit > 3 * 24 * 60 * 60 * 1000) {
									this.tips = '企划方已超时超过3天，可主动发起超时中止。';
									this.isDiscontinue = true;
									this.rate = Number(this.key.rate ?? 0) * 100;
								} else {
									this.tips = '企划方超时未超时超过3天，不可发起超时中止。';
									this.isDiscontinue = false;
								}
							}
						}
					});
				} else {
					if (this.key.detail.commission.day > 10) {
						this.tips = '企划方超时未超时超过5天，不可发起超时中止。';
						this.isDiscontinue = false;
					} else {
						this.tips = '企划方超时未超时超过3天，不可发起超时中止。';
						this.isDiscontinue = false;
					}
				}
			}
		}
	}

	cancel(): void {
		this.modalRef.close();
		this.rate = null;
	}
	sure(): void {
		if (this.isDiscontinue) {
			this.api.discontinue(this.key.id, 3).subscribe(
				s => {
					this.modalRef.close(1);
					this.rate = null;
				},
				e => {
					this.isError.ifError(e.code);
				}
			);
		} else {
			this.modalRef.close();
			this.rate = null;
		}
	}
}
