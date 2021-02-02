import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';
import { CommissionDetailErrorService } from '../commission-detail-error.service';
import { CommissionAddmoney } from '../commission-pop-component/commission-addmoney/commission-addmoney';

@Component({
	selector: 'ivo-commission-createtip',
	templateUrl: './commission-createtip.page.html',
	styleUrls: ['./commission-createtip.page.less'],
})
export class CommissionCreatetipPage implements OnInit {
	identity: number;

	underwayTip: any;

	status = this.detail.commissionStatus$.value;
	commissionId = this.detail.getCommissionId();

	tipList: {
		list: {
			id: number;
			amount: number;
			completeTime: number;
			status: number;
			applyTime: number;
			description: string;
		}[];
	};

	refresh$ = new BehaviorSubject(0);

	constructor(
		private api: CommissionApiService,
		private modal: ModalService,
		private detail: CommissionDetailService,
		private route: ActivatedRoute,
		private router: Router,
		private cdr: ChangeDetectorRef,
		private isError: CommissionDetailErrorService
	) { }

	tipsList$ = combineLatest([this.refresh$, this.route.queryParams]).pipe(
		switchMap(([_r, p]) => {
			return this.api.tipsList(p.id).pipe(
				tap(l => {
					this.tipList = l;
					this.underwayTip = l.list.filter(a => a.status === 0)[0];
					this.cdr.detectChanges();
				})
			);
		})
	);

	ngOnInit(): void {
		this.identity = this.detail.getIdentity();
	}

	addTip(): void {
		if (!this.underwayTip) {
			if (this.detail.commissionStatus$.value === 2) {
				this.modal
					.open(CommissionAddmoney)
					.afterClosed()
					.subscribe(s => {
						if (s) {
							this.api.createTips(this.detail.getCommissionId(), s?.money, s?.text).subscribe(
								_i => {
									this.tipList.list.unshift({
										id: -1,
										amount: Number(s.money) * 10,
										completeTime: -1,
										status: 0,
										applyTime: new Date().getTime(),
										description: s.text,
									});
									this.cdr.detectChanges();
								},
								e => {
									if (e.code === 10704) {
										this.modal.open(PopTips, ['企划状态异常，无法发起增加稿酬', false]);
									} else {
										this.isError.ifError(e.code);
									}
								}
							);
						}
					});
			} else {
				this.modal.open(PopTips, ['企划当前状态无法发起增加稿酬。', false]);
			}
		} else {
			this.modal.open(PopTips, ['您已发起“增加稿酬”，无法重复发起。', false]);
		}
	}

	audit(id: number, i: number): void {
		this.modal
			.open(PopTips, [i === 1 ? '是否同意增加稿酬？' : '是否拒绝增加稿酬？', true])
			.afterClosed()
			.subscribe(is => {
				if (is) {
					if (this.status === 2) {
						this.api.auditTips(id, i).subscribe(
							s => {
								if (i === 1) {
									this.router.navigate(['/pay'], {
										queryParams: {
											tradeId: s.payId,
										},
										queryParamsHandling: 'merge',
									});
								} else if (i === 2) {
									this.underwayTip = undefined;
									this.tipList.list.splice(0, 1, {
										...this.tipList.list[0],
										status: 2,
										completeTime: new Date().getTime(),
									});
									this.refresh$.next(1);
									this.cdr.detectChanges();
								}
							},
							e => {
								this.isError.ifError(e.code);
							}
						);
					} else {
						this.modal.open(PopTips, ['企划当前状态无法处理增加稿酬。', false]);
					}
				}
			});
	}
}
