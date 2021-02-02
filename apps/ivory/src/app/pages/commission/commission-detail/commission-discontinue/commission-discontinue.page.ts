import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState, ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';
import { CommissionDetailErrorService } from '../commission-detail-error.service';
import { CommissionPrevent } from '../commission-pop-component/commission-prevent/commission-prevent';
import { CommissionReject } from '../commission-pop-component/commission-reject/commission-reject';
import { CommissionTimeout } from '../commission-pop-component/commission-timeout/commission-timeout';

@Component({
	selector: 'ivo-commission-discontinue',
	templateUrl: './commission-discontinue.page.html',
	styleUrls: ['./commission-discontinue.page.less'],
})
export class CommissionDiscontinuePage implements OnInit {
	@Select(UserState.id)
	id$: Observable<number>;

	@ViewChild('input') input: HTMLInputElement;

	receiver: any;
	sponsor: any;
	identity: number;

	showTitle: string;
	showTip: string;
	timeWord: string;
	time: number;

	status$ = this.detail.commissionStatus$;

	refresh$ = new BehaviorSubject(0);

	change$ = new BehaviorSubject(0);

	isShowFile = false;

	// 上传文件列表
	fileList: { token: string; url: string; name: string }[] = [];

	latestRecord: {
		id: number;
		applytime: number;
		replytime: number;
		rate: number;
		userid: number;
		status: number;
		type: number;
	};
	latestSubmit: {
		list: {
			id: number;
			submitFiles: Array<string>;
			submitTime: number;
			status: number;
			audit: {
				auditTime: number;
				images: Array<string>;
				description: string;
			};
		}[];
	} = { list: [] };

	constructor(
		private route: ActivatedRoute,
		private api: CommissionApiService,
		private detail: CommissionDetailService,
		private modal: ModalService,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private isError: CommissionDetailErrorService
	) { }

	discontinueList$ = combineLatest([this.refresh$, this.route.queryParams]).pipe(
		switchMap(([_r, p]) => {
			return this.api.discontinueList(p.id).pipe(
				tap(s => {
					if (s.list[0]?.status === 0 || ([3, 0].includes(s.list[0]?.type) && s.list[0]?.status === 1)) {
						this.latestRecord = {
							id: s.list[0]?.id,
							applytime: s.list[0]?.applyTime,
							replytime: s.list[0]?.replyTime,
							rate: s.list[0]?.rate,
							userid: s.list[0]?.userId,
							status: s.list[0]?.status,
							type: s.list[0]?.type,
						};
						this.select();
					} else {
						this.latestRecord = null;
					}

					this.cdr.detectChanges();
				})
			);
		})
	);

	/**用于判断是否显示驳回记录 */
	isReject: number;

	commitRecord$ = this.refresh$
		.pipe(
			switchMap(_p => {
				return this.api.discontinueFileRecords(this.detail.getCommissionId()).pipe(
					tap(s => {
						this.latestSubmit = s;
						this.isReject = s.list.filter(l => l.status === 2).length;
						this.cdr.detectChanges();
					})
				);
			})
		)
		.subscribe();

	ngOnInit(): void {
		this.receiver = this.detail.getDetailValue().receiver;
		this.sponsor = this.detail.getDetailValue().sponsor;
		this.identity = this.detail.getIdentity();
		this.api.discontinueFileRecords(this.detail.getCommissionId()).subscribe(s => {
			this.latestSubmit = s;
			this.cdr.detectChanges();
		});
	}

	select(): void {
		if (this.latestRecord.type === 0 && this.latestRecord.status === 0) {
			this.showTitle = '协商中止：';
			this.timeWord = '发起时间：';
			this.time = this.latestRecord.applytime;
			if (this.sponsor.id === this.latestRecord.userid) {
				this.showTip = '企划方发起协商中止企划，等待应征方处理。';
			} else if (this.receiver.id === this.latestRecord.userid) {
				this.showTip = '应征方发起协商中止企划，等待企划方处理。';
			}
		} else if (this.latestRecord.type === 2 && this.latestRecord.status === 0) {
			this.time = this.latestRecord.applytime;
			this.showTitle = '平台介入：';
			this.timeWord = '发起时间：';
			if (this.sponsor.id === this.latestRecord.userid) {
				this.showTip = '企划方发起平台介入，等待平台处理。';
			} else if (this.receiver.id === this.latestRecord.userid) {
				this.showTip = '应征方发起平台介入，等待平台处理。';
			}
		} else if (this.latestRecord.type === 3 && this.latestRecord.status === 0) {
			this.time = this.latestRecord.applytime;
			this.showTitle = '平台介入：';
			this.timeWord = '发起时间：';
			if (this.sponsor.id === this.latestRecord.userid) {
				this.showTip = '企划方发起平台介入，等待平台处理。';
			} else if (this.receiver.id === this.latestRecord.userid) {
				this.showTip = '应征方发起平台介入，等待平台处理。';
			}
		} else if (this.latestRecord.status === 1) {
			switch (this.latestRecord.type) {
				case 0:
					this.showTitle = '协商中止：';
					if (this.latestSubmit?.list.length > 0) {
						if (this.latestSubmit?.list[0].status === 0) {
							this.showTip = '画师/模型师已提交当前阶段源文件，等待企划方审核。';
							this.time = this.latestRecord.replytime;
							this.timeWord = '提交时间：';
							this.isShowFile = true;
						} else if (this.latestSubmit?.list[0].status === 2) {
							this.showTip = '源文件有误，企划方已驳回，请在驳回记录中查看原因。';
							this.time = this.latestSubmit?.list[0].audit.auditTime;
							this.timeWord = '驳回时间：';
						} else {
							this.showTip = '源文件无误，企划中止完成。';
							this.time = this.latestSubmit?.list[0].submitTime;
							this.timeWord = '中止完成时间：';
							this.isShowFile = true;
						}
					} else {
						if (this.status$.value === 6) {
							console.log('中止完成');
							this.showTip = '协商中止已完成。';
							this.time = this.latestRecord.replytime;
							this.timeWord = '中止时间：';
						} else {
							this.showTip = '协商中止已确认，等待画师/模型师提交当前阶段源文件。';
							this.time = this.latestRecord.replytime;
							this.timeWord = '中止时间：';
						}
					}

					break;
				case 3:
					this.showTitle = '超时中止：';
					if (this.receiver.id === this.latestRecord.userid) {
						if (this.latestSubmit?.list.length > 0) {
							if (this.latestSubmit?.list[0]?.status === 2) {
								this.showTip = '源文件有误，平台方已驳回，请修改重新提交。';
								this.time = this.latestSubmit?.list[0]?.audit.auditTime;
								this.timeWord = '驳回时间：';
							} else if (this.latestSubmit?.list[0]?.status === 1) {
								this.showTip = '应征方提交源文件，平台审核通过。';
								this.time = this.latestSubmit?.list[0]?.audit.auditTime;
								this.timeWord = '中止完成时间：';
								this.isShowFile = true;
							} else {
								if (this.receiver.id === this.latestRecord.userid) {
									if (this.identity === 1) {
										this.showTip = '应征方发起企划方超时中止，等待平台处理。';
									} else {
										this.showTip = '已提交阶段节点源文件，等待平台审核。';
										this.isShowFile = true;
									}
								}
								this.time = this.latestRecord?.applytime;
								this.timeWord = '提交时间：';
							}
						} else {
							if (this.receiver.id === this.latestRecord.userid) {
								if (this.identity === 1) {
									this.showTip = '应征方发起企划方超时中止，等待平台处理。';
								} else {
									this.showTip = '请提交当前阶段节点源文件至平台方审核。';
								}
							}
							this.time = this.latestRecord?.applytime;
							this.timeWord = '中止时间：';
						}
					} else {
						this.showTip = '企划方已发起画师/模型师超时中止，企划已中止。';
					}
					break;
			}
		}
	}

	// 上传文件

	updateFile(event: any): void {
		if (event.size <= 1024 * 1024 * 1024) {
			const form = new FormData();
			form.append('f', event);
			this.api.uploadFile(form).subscribe(s => {
				this.fileList.push({
					name: '文件' + (this.fileList.length + 1) + '.' + s.url.split('.')[s.url.split('.').length - 1],
					token: s.token,
					url: s.url,
				});
				this.cdr.detectChanges();
				this.input.value = null;
			});
		} else {
			this.modal.open(PopTips, ['上传文件大小不能超过1G', false]);
		}
	}

	// 删除上传文件
	delete(i: number): void {
		this.fileList.splice(i, 1);
	}

	discontinue(p: number): void {
		this.api.cancelOrders(this.detail.getCommissionId()).subscribe(
			_ => {
				if ([2, 4].includes(this.detail.commissionStatus$.value)) {
					if (p === 3) {
						this.modal
							.open(CommissionTimeout, {
								type: p,
								id: this.detail.getCommissionId(),
								identity: this.detail.getIdentity(),
								isSponsorTimeout: this.detail.isSponsorTimeout(),
								detail: this.detail.getDetailValue(),
								rate: this.detail.getCurrentNodeRate(),
							})
							.afterClosed()
							.subscribe(s => {
								if (s) {
									this.refresh$.next(s);
									this.api.commissionStatus(this.detail.getCommissionId()).subscribe(i => {
										this.detail.commissionStatus$.next(i.status);
									});
								}
							});
					} else {
						this.modal
							.open(CommissionPrevent, {
								type: p,
								id: this.detail.getCommissionId(),
							})
							.afterClosed()
							.subscribe(s => {
								if (s) {
									this.refresh$.next(s);
									this.api.commissionStatus(this.detail.getCommissionId()).subscribe(i => {
										this.detail.commissionStatus$.next(i.status);
									});
								}
							});
					}
				} else {
					this.modal.open(PopTips, ['企划当前状态无法发起中止', false]);
				}
			},
			e => {
				this.isError.ifError(e.code);
			}
		);
	}

	confirm(id: number, i: number): void {
		this.modal
			.open(PopTips, [i === 1 ? '是否同意中止？' : '是否拒绝中止？', true])
			.afterClosed()
			.subscribe(is => {
				if (is) {
					this.api.discontinueConfirm(id, i).subscribe(_ => {
						this.refresh$.next(4);
						this.api.commissionStatus(this.detail.getCommissionId()).subscribe(a => {
							this.detail.commissionStatus$.next(a.status);
						});
					});
				}
			});
	}

	submitFile(): void {
		const list = [];
		this.fileList.forEach(l => {
			list.push(l.token);
		});
		if (this.fileList.length > 0) {
			this.api.discontinueSubmitFile(this.detail.getCommissionId(), list).subscribe(
				_ => {
					this.refresh$.next(3);
				},
				e => {
					this.isError.ifError(e.code);
				}
			);
		} else {
			this.modal.open(PopTips, ['请上传源文件', false]);
		}
	}

	auditFile(id: number, p: number): void {
		if (p === 1) {
			this.modal
				.open(PopTips, ['是否确认源文件无误？', true])
				.afterClosed()
				.subscribe(is => {
					if (is) {
						this.api.discontinueAuditFile(id, p).subscribe(
							_ => {
								this.api.commissionStatus(this.detail.getCommissionId()).subscribe(i => {
									this.detail.commissionStatus$.next(i.status);
								});
								// this.change$.next(1);
								this.refresh$.next(3);
							},
							e => {
								this.isError.ifError(e.code);
							}
						);
					}
				});
		} else {
			this.modal
				.open(CommissionReject, {
					type: 0,
					c: this.detail.getDetailValue().commission.category,
				})
				.afterClosed()
				.subscribe(i => {
					if (i) {
						if (i[1]) {
							this.api.discontinueAuditFile(id, p, i[0], i[1]).subscribe(
								_ => {
									this.refresh$.next(3);
								},
								e => {
									this.isError.ifError(e.code);
								}
							);
						} else {
							this.api.discontinueAuditFile(id, p, i[0]).subscribe(
								_ => {
									this.refresh$.next(3);
								},
								e => {
									this.isError.ifError(e.code);
								}
							);
						}
					}
				});
		}
	}

	toFileRecord(): void {
		this.router.navigate(['/commission/detail/reject-file'], {
			queryParamsHandling: 'merge',
		});
	}
}
