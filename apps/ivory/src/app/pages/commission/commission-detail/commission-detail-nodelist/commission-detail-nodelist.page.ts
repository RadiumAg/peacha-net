import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService, ZoomService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IllustZoomModalComponent } from '../../../work/illust-zoom-modal/illust-zoom-modal.component';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';
import { CommissionDetailErrorService } from '../commission-detail-error.service';
import { CommissionPrompt } from '../commission-pop-component/commission-prompt/commission-prompt';


@Component({
	selector: 'ivo-commission-detail-nodelist',
	templateUrl: './commission-detail-nodelist.page.html',
	styleUrls: ['./commission-detail-nodelist.page.less'],
})
export class CommissionDetailNodelistPage implements OnInit {
	constructor(
		private route: ActivatedRoute,
		private commissionApi: CommissionApiService,
		private detail: CommissionDetailService,
		private modal: ModalService,
		private isError: CommissionDetailErrorService,
		private cdr: ChangeDetectorRef,
		private zoom: ZoomService
	) { }

	change$ = new BehaviorSubject(0);
	nodeList: {
		id: number;
		submitFiles: Array<string>;
		submitTime: number;
		status: number;
		audit: {
			auditTime: number;
			images: Array<string>;
			description: string;
		};
		appeal: {
			applyTime: number;
			auditTime: number;
			status: number;
			auditDescription: string;
		};
	}[] = [];

	currentNode: any;

	identity: number;

	commissionType: number;
	currentNodeId: number;
	commissionNodeList: any;

	isShowAppeal = false;

	isShowRevokeAppeal = false;

	list$ = combineLatest([this.change$, this.route.queryParams])
		.pipe(
			switchMap(([_c, p]) => {
				if (p.node) {
					return this.commissionApi.nodeSubmitRecords(p.node).pipe(
						tap(s => {
							this.isShowAppeal = false;
							this.isShowRevokeAppeal = false;
							this.currentNodeId = p.node;
							if ((s.list[0]?.status === 2 || s.list[0]?.status === 3) && !s.list[0]?.appeal) {
								this.isShowAppeal = true;
							} else if ((s.list[0]?.status === 2 || s.list[0]?.status === 3) && s.list[0]?.appeal && s.list[0]?.appeal.status === 0) {
								this.isShowRevokeAppeal = true;
							}
							this.nodeList = s?.list.filter(l => l.status != 0 && l.status != 1);

							this.cdr.detectChanges();
						})
					);
				} else {
					return EMPTY;
				}
			})
		)
		.subscribe();

	ngOnInit(): void {
		this.commissionType = this.detail.getDetailValue().commission.category;
		this.commissionNodeList = this.detail.getDetailValue().nodeList;
		this.identity = this.detail.getIdentity();

		this.route.queryParams.subscribe(p => {
			if (p.node) {
				this.currentNodeId = p.node;
				this.currentNode = this.detail.getDetailValue().nodeList.filter(l => Number(l.id) === Number(p.node));
			}
		});
	}

	update(i: number): void {
		this.change$.next(i);
	}

	discontinue(): void {
		// this.modal.open(CommissionPrevent, { type: 2, id: this.detail.getCommissionId() }).afterClosed().subscribe(s => {
		//   if (s) {
		//     this.commissionApi.commissionStatus(this.detail.getCommissionId()).subscribe(s => {
		//       this.detail.commissionStatus$.next(s.status);
		//     }, e => {
		//       this.isError.ifError(e.code);
		//     })
		//   }
		// })
		this.commissionApi.nodeAppeal(this.detail.getCommissionId()).subscribe(
			_s => {
				this.modal.open(PopTips, ['申请平台介入成功！', false, 1]).afterClosed().subscribe(_s => {
					this.change$.next(2);
				});
			},
			e => {
				this.isError.ifError(e.code);
			}
		);
	}

	showDetail(data: string): void {
		this.zoom.open(IllustZoomModalComponent, {
			assets: [data],
			index: 0,
		});
	}

	revokediscontinue(): void {
		this.modal.open(CommissionPrompt, { title: '撤回平台介入驳回', tips: '是否确定撤回平台介入驳回？' }).afterClosed().subscribe(is => {
			if (is) {
				this.commissionApi.nodeRevokeAppeal(this.detail.getCommissionId()).subscribe(
					_s => {
						this.change$.next(1);
					}, _e => {
						this.modal.open(CommissionPrompt, { title: '企划状态变化', tips: '企划状态已发生变化，请刷新页面后查看。' })
					})
			}
		})
	}
}
