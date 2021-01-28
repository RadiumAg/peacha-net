import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalService, ZoomService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IllustZoomModalComponent } from '../../../work/illust-zoom-modal/illust-zoom-modal.component';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';
import { CommissionDetailErrorService } from '../commission-detail-error.service';
import { CommissionPrevent } from '../commission-pop-component/commission-prevent/commission-prevent';

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
  ) {}

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

  list$ = combineLatest([this.change$, this.route.queryParams])
    .pipe(
      switchMap(([c, p]) => {
        if (p.node) {
          return this.commissionApi.nodeSubmitRecords(p.node).pipe(
            tap((s) => {
              this.isShowAppeal = false;
              this.currentNodeId = p.node;
              if (
                (s.list[0]?.status === 2 || s.list[0]?.status === 3) &&
                !s.list[0]?.appeal
              ) {
                this.isShowAppeal = true;
              }
              this.nodeList = s?.list.filter(
                (l) => l.status != 0 && l.status != 1
              );
              // if (s.list[0]?.status === 2 && s.list[0]?.appeal?.status === 0) {
              //   this.nodeList.unshift(s.list[0]);
              // };
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

    this.route.queryParams.subscribe((p) => {
      if (p.node) {
        this.currentNodeId = p.node;
        this.currentNode = this.detail
          .getDetailValue()
          .nodeList.filter((l) => Number(l.id) === Number(p.node));
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
      (s) => {
        this.modal.open(PopTips, ['申请平台介入成功！', false, 1]);
      },
      (e) => {
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
}
