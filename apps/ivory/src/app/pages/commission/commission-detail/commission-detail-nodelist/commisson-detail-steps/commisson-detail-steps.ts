import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalService, ZoomService } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';
import { UploadImageDirective } from 'libs/peacha-core/src/lib/components/uploadImage/uploadImage.directive';
import { BehaviorSubject } from 'rxjs';
import { IllustZoomModalComponent } from '../../../../work/illust-zoom-modal/illust-zoom-modal.component';
import { CommissionApiService } from '../../../service/commission-api.service';
import { CommissionDetailService } from '../../../service/detail.service';
import { CommissionDetailErrorService } from '../../commission-detail-error.service';
import { CommissionReject } from '../../commission-pop-component/commission-reject/commission-reject';
import { CommissionTimeout } from '../../commission-pop-component/commission-timeout/commission-timeout';

@Component({
  selector: 'ivo-commission-detail-steps',
  templateUrl: './commisson-detail-steps.html',
  styleUrls: ['./commisson-detail-steps.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommissionDetailSteps implements OnInit {
  // @ViewChild('translate') translateBox: ElementRef;

  @Output() update = new EventEmitter<any>();
  active: number;

  dataList: Array<any>;

  // showTitle: string;

  // index_type: number;
  // index_status: number;
  index_c = this.detail.getDetailValue().commission.category;
  // index_file_type: number;
  // index_node_rejectCount: number;

  indexNode: any;

  status = this.detail.commissionStatus$.value;
  commissionId = this.detail.getCommissionId();

  identity = this.detail.getIdentity();
  commissionStarttime = this.detail.getDetailValue().commission.startTime;
  modifyCount: number;

  isSponsorTimeout$ = new BehaviorSubject(false);

  // 节点Id
  // nodeId: number;

  // 最后一个节点位置
  lastNode: number;

  // 上传图片列表
  imageList: { token: string; url: string }[] = [];
  // 上传文件列表
  fileList: { token: string; url: string; name: string }[] = [];

  // 选中显示的节点
  showIndex: number;

  // 节点提交详情列表
  nodeList: {
    id: number;
    recordlist: {
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
        appeal: {
          applyTime: number;
          auditTime: number;
          status: number;
        };
      }[];
    };
  }[] = [];

  // 当前显示的节点提交详情
  indexNodeDetail: {
    id: number;
    recordlist: {
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
        appeal: {
          applyTime: number;
          auditTime: number;
          status: number;
        };
      }[];
    };
  };

  p = '';
  isShowReportProgress = false;

  // 为方便模板显示，数组中的c表示企划类型，与其他页面的类型定义不同。
  // 此处c:1表示live2d,c:0表示插画，c:-1表示全部
  // index:0表示除最后一个节点外的节点，index:1表示最后一个节点
  // btn中的color用于绑定按钮样式
  // express.p  1：表示开始确认时间(submittime)；0：表示确认时间；2:表示支付时间
  showNodeList = [
    {
      type: 0,
      status: 0,
      c: -1,
      key: '双方沟通确认细节，等待企划方发起开始确认。',
      cbtn: [
        { t: '编辑企划', color: 1, fun: 'seven' },
        { t: '发起开始确认', color: 0, fun: 'one' },
      ],
    },
    {
      type: 0,
      status: 1,
      c: 0,
      key: '企划方已发起开始确认，等待画师确认。',
      pbtn: [
        { t: '企划有误', color: 1, fun: 'two', p: 1 },
        { t: '企划确认无误', color: 0, fun: 'two', p: 0 },
      ],
      express: [{ p: '企划方发起开始确认时间：', t: 1 }],
    },
    {
      type: 0,
      status: 1,
      c: 1,
      key: '企划方已发起开始确认，等待模型师确认。',
      pbtn: [
        { t: '企划有误', color: 1, fun: 'two', p: 1 },
        { t: '企划确认无误', color: 0, fun: 'two', p: 0 },
      ],
      express: [{ p: '企划方发起开始确认时间：', t: 1 }],
    },
    {
      type: 0,
      status: 2,
      c: 0,
      key: '双方均已确认，等待企划方支付保障金。',
      cbtn: [{ t: '支付保证金', color: 0, fun: 'three' }],
      express: [{ p: '画师确认时间：', t: 0 }],
    },
    {
      type: 0,
      status: 2,
      c: 1,
      key: '双方均已确认，等待企划方支付保障金。',
      cbtn: [{ t: '支付保证金', color: 0, fun: 'three' }],
      express: [{ p: '模型师确认时间：', t: 0 }],
    },
    {
      type: 0,
      status: 3,
      c: -1,
      key: '双方均已确认无误，企划正式开始。',
      express: [
        { p: '企划方发起开始确认时间：', t: 1 },
        { p: '应征方确认时间：', t: 0 },
        { p: '企划方支付保证金时间：', t: 2 },
      ],
    },
    {
      type: 0,
      status: 4,
      c: 0,
      key: '企划细节有误，画师已驳回，请修改后重新发起确认。',
      cbtn: [
        { t: '编辑企划', color: 1, fun: 'seven' },
        { t: '发起开始确认', color: 0, fun: 'one' },
      ],
      express: [{ p: '画师驳回时间：', t: 0 }],
    },
    {
      type: 0,
      status: 4,
      c: 1,
      key: '企划细节有误，模型师已驳回，请修改后重新发起确认。',
      cbtn: [
        { t: '编辑企划', color: 1, fun: 'seven' },
        { t: '发起开始确认', color: 0, fun: 'one' },
      ],
      express: [{ p: '模型师驳回时间：', t: 0 }],
    },
    {
      type: 1,
      status: 0,
      c: 1,
      key: '等待企划方提交绑定文件。',
      cbtn: [{ t: '提交绑定文件', color: 0, fun: 'four' }],
      isShowUpload: true,
    },
    {
      type: 1,
      status: 1,
      c: 1,
      key: '等待模型师确认绑定文件。',
      pbtn: [
        { t: '绑定文件有误', color: 1, fun: 'five', p: 2 },
        { t: '绑定文件无误', color: 0, fun: 'five', p: 1 },
      ],
      express: [{ p: '企划方提交绑定文件时间：', t: 1 }],
      note: '退回记录',
    },
    {
      type: 1,
      status: 3,
      c: 1,
      key: '已完成',
      express: [
        { p: '企划方提交绑定文件时间：', t: 1 },
        { p: '模型师确认时间：', t: 0 },
      ],
      note: '退回记录',
    },
    {
      type: 1,
      status: 4,
      c: 1,
      key: '模型师已退回绑定文件，请在“退回记录”中查看退回原因。',
      cbtn: [{ t: '提交绑定文件', color: 0, fun: 'four' }],
      express: [{ p: '模型师退回时间：', t: 0 }],
      note: '退回记录',
      isShowUpload: true,
    },
    {
      type: 2,
      status: 0,
      c: 0,
      key: '等待画师完成当前阶段节点。',
      pbtn: [{ t: '提交审核', color: 0, fun: 'four' }],
      isShowUpload: true,
    },
    {
      type: 2,
      status: 0,
      c: 1,
      key: '等待模型师完成当前阶段节点',
      pbtn: [{ t: '提交审核', color: 0, fun: 'four' }],
      isShowUpload: true,
    },
    {
      type: 2,
      status: 1,
      c: 0,
      key: '画师已完成当前阶段节点，等待企划方验收。',
      cbtn: [
        { t: '驳回', color: 1, fun: 'five', p: 2 },
        { t: '退回修改', color: 1, fun: 'five', p: 3 },
        { t: '审核通过', color: 0, fun: 'nine', p: 1 },
        { t: '审核通过，企划完成', color: 0, fun: 'eight', p: 1 },
      ],
      pbtn: [
        { t: '企划方长时间不审核？', color: 0, fun: 'six', p: 3, time: 1 },
      ],
      express: [{ p: '画师提交审核时间：', t: 1 }],
      note: '驳回/退回记录',
    },
    {
      type: 2,
      status: 1,
      c: 1,
      key: '模型师已提交文件，等待企划方审核。',
      cbtn: [
        { t: '驳回', color: 1, fun: 'five', p: 2 },
        { t: '退回修改', color: 1, fun: 'five', p: 3 },
        { t: '审核通过', color: 0, fun: 'nine', p: 1 },
        { t: '审核通过，企划完成', color: 0, fun: 'eight', p: 1 },
      ],
      pbtn: [
        { t: '企划方长时间不审核？', color: 0, fun: 'six', p: 3, time: 1 },
      ],
      express: [{ p: '模型师提交审核时间：', t: 1 }],
      note: '退回记录',
    },
    {
      type: 2,
      status: 3,
      c: -1,
      key: '已完成',
      express: [
        { p: '应征方提交审核时间：', t: 1 },
        { p: '企划方确认时间：', t: 0 },
      ],
      note: '退回记录',
    },
    {
      type: 2,
      status: 4,
      c: 0,
      key: '企划方退回/驳回此阶段节点，请在“退回/驳回记录”中查看原因。',
      pbtn: [{ t: '提交审核', color: 0, fun: 'four' }],
      isShowUpload: true,
      express: [{ p: '企划方驳回/退回时间：', t: 0 }],
      note: '驳回/退回记录',
    },
    {
      type: 2,
      status: 4,
      c: 1,
      key: '企划方退回此阶段节点，请在“退回记录”中查看原因。',
      pbtn: [{ t: '提交审核', color: 0, fun: 'four' }],
      isShowUpload: true,
      express: [{ p: '企划方退回时间：', t: 0 }],
      note: '退回记录',
    },
    {
      type: 2,
      status: 5,
      c: 0,
      key: '画师对驳回有异议，发起平台介入。等待平台介入结果。',
      pbtn: [],
      isShowUpload: false,
      express: [],
    },
    {
      type: 2,
      status: 5,
      c: 1,
      key: '模型师对驳回有异议，发起平台介入。等待平台介入结果。',
      pbtn: [],
      isShowUpload: false,
      express: [],
    },
  ];

  lastNodeDetail: any;
  reject: number;

  constructor(
    private commissionApi: CommissionApiService,
    private detail: CommissionDetailService,
    private modal: ModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private isError: CommissionDetailErrorService,
    private zoom: ZoomService,
    private render: Renderer2
  ) {}

  ngOnInit(): void {
    this.commissionApi
      .nodeModifyCount(this.detail.getCommissionId())
      .subscribe((i) => {
        if (this.detail.getDetailValue().commission.modifyCount >= i.count) {
          this.modifyCount =
            this.detail.getDetailValue().commission.modifyCount - i.count;
        } else {
          this.modifyCount = 0;
        }
        this.cdr.detectChanges();
      });

    this.commissionApi
      .nodeList(this.detail.getCommissionId())
      .subscribe((s) => {
        this.dataList = s.list;
        this.cdr.detectChanges();
        this.active = this.dataList.findIndex((l) => l.status != 3);
        this.detail.setCurrentNodeRate(
          this.dataList[this.active == 0 ? 0 : this.active - 1]?.rate
        );

        // 若企划全部完成，显示的当前节点为最后一个节点
        if (this.active === -1) {
          this.showIndex = this.dataList.length - 1;
        } else {
          this.showIndex = this.active;
        }

        // this.showTitle = this.dataList[this.showIndex]?.name;
        // this.index_status = this.dataList[this.showIndex]?.status;
        // this.index_type = this.dataList[this.showIndex]?.type;
        // this.nodeId = this.dataList[this.showIndex]?.id;
        this.lastNode = this.dataList.length - 1;
        // this.index_file_type = this.dataList[this.showIndex]?.fileType;
        // this.index_node_rejectCount = this.dataList[this.showIndex]?.rejectCount;

        this.indexNode = this.dataList[this.showIndex];
        console.log(this.indexNode);

        this.router.navigate([], {
          queryParams: {
            node: this.dataList[this.showIndex]?.id,
          },
          queryParamsHandling: 'merge',
        });

        // 请求当前节点的提交列表
        this.getNodeSubmitRecord(this.dataList[this.showIndex]?.id);
      });
  }

  isSponsorTimeout(): boolean {
    if (this.detail.getDetailValue().commission.day > 10) {
      if (
        new Date().getTime() -
          this.indexNodeDetail?.recordlist.list[0]?.submitTime >
        5 * 24 * 60 * 60 * 1000
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (
        new Date().getTime() -
          this.indexNodeDetail?.recordlist.list[0]?.submitTime >
        3 * 24 * 60 * 60 * 1000
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  // 选中某一节点
  select(
    ac: number,
    name: string,
    status: number,
    type: number,
    index: number,
    node_id: number,
    file_type: number
  ): void {
    this.showIndex = index;
    if (this.showIndex <= ac || this.active === -1) {
      // this.showTitle = name;
      // this.index_type = type;
      // this.index_status = status;
      // this.index_file_type = file_type;
      // this.nodeId = node_id;

      this.indexNode = this.dataList[this.showIndex];

      this.router.navigate([], {
        queryParams: {
          node: this.dataList[this.showIndex]?.id,
        },
        queryParamsHandling: 'merge',
      });

      this.getNodeSubmitRecord(node_id);
    }
  }

  // 获取当前节点的提交列表

  getNodeSubmitRecord(i: number, is?: boolean): void {
    const index = this.nodeList.findIndex((l) => l.id === i);

    if (index === -1 || is) {
      this.commissionApi.nodeSubmitRecords(i).subscribe(
        (o) => {
          const n = { id: this.dataList[this.showIndex]?.id, recordlist: o };
          if (index > -1) {
            this.nodeList.splice(index, 1, n);
          } else {
            this.nodeList.push(n);
          }
          this.nodeList.push(n);
          this.indexNodeDetail = n;
          this.isSponsorTimeout$.next(this.isSponsorTimeout());
          this.cdr.detectChanges();
          if (is) {
            this.update.emit(1);
          }
        },
        (e) => {
          this.isError.ifError(e.code);
        }
      );
    } else {
      this.indexNodeDetail = this.nodeList[index];
      this.isSponsorTimeout$.next(this.isSponsorTimeout());
      this.cdr.detectChanges();
    }
  }

  // 上传图片
  updatePic(
    event: any,
    input: HTMLInputElement,
    u: UploadImageDirective
  ): void {
    if (event.type.split('image').length > 1) {
      // const form = new FormData();
      // form.append('f', event);
      // this.commissionApi.uploadFile(form).subscribe(s => {
      //     this.imageList.push(s);
      //     input.value = null;
      //     this.cdr.detectChanges();
      // });
      u.upload(event);
      input.value = null;
    } else {
      this.modal.open(PopTips, ['请上传图片', false]);
    }
  }

  r(e: any): void {
    if (typeof e === 'string') {
      this.p = e;
      this.isShowReportProgress = true;
    } else {
      this.isShowReportProgress = false;
      this.imageList.push(e);
      this.cdr.detectChanges();
    }
  }

  result(e: any): void {
    if (typeof e === 'string') {
      this.p = e;
      this.isShowReportProgress = true;
    } else {
      this.isShowReportProgress = false;
      this.fileList.push({
        name:
          '文件' +
          (this.fileList.length + 1) +
          '.' +
          e.url.split('.')[e.url.split('.').length - 1],
        token: e.token,
        url: e.url,
      });
      this.cdr.detectChanges();
    }
  }

  // 上传文件

  updateFile(
    event: any,
    input: HTMLInputElement,
    u: UploadImageDirective
  ): void {
    if (event.size <= 1024 * 1024 * 1024) {
      // const form = new FormData();
      // form.append('f', event);
      // this.commissionApi.uploadFile(form).subscribe(s => {
      //     this.fileList.push({ name: '文件' + (this.fileList.length + 1) + '.' + s.url.split('.')[s.url.split('.').length - 1], token: s.token, url: s.url });
      //     this.cdr.detectChanges();

      // })
      u.upload(event);
      input.value = null;
    } else {
      this.modal.open(PopTips, ['上传文件大小不能超过1G', false]);
    }
  }

  // 删除上传文件
  delete(i: number, type: number): void {
    if (type === 1) {
      this.imageList.splice(i, 1);
    } else {
      this.fileList.splice(i, 1);
    }
  }

  func(type: string, p: number): void {
    switch (type) {
      case 'one':
        this.launchConfirm();
        break;
      case 'two':
        this.confirm(p);
        break;
      case 'three':
        this.pay();
        break;
      case 'four':
        this.submit();
        break;
      case 'five':
        this.audit(p);
        break;
      case 'six':
        this.discontinue();
        break;
      case 'seven':
        this.edit();
        break;
      case 'eight':
        this.audit(p);
        break;
      case 'nine':
        this.audit(p);
        break;
    }
  }

  /**商家发起确认企划 */
  launchConfirm(): void {
    this.modal
      .open(PopTips, ['是否发起开始确认？', true])
      .afterClosed()
      .subscribe((is) => {
        if (is) {
          this.commissionApi.launchConfirm(this.indexNode.id).subscribe(
            (_) => {
              // 改变node状态
              // this.index_status = 1;
              this.indexNode = { ...this.indexNode, status: 1 };
              this.getNodeSubmitRecord(this.indexNode.id, true);
              this.cdr.detectChanges();
              // this.translate();
            },
            (e) => {
              this.isError.ifError(e.code);
            }
          );
        }
      });
  }

  /**画师确认企划 */

  confirm(p: number): void {
    this.modal
      .open(PopTips, [
        p === 0 ? '是否确认企划无误？' : '是否确认企划有误？',
        true,
      ])
      .afterClosed()
      .subscribe((is) => {
        if (is) {
          this.commissionApi.confirmCommission(this.indexNode.id, p).subscribe(
            (_) => {
              // 改变node状态
              if (p === 0) {
                // this.index_status = 2;
                this.indexNode = { ...this.indexNode, status: 2 };
                this.getNodeSubmitRecord(this.indexNode.id, true);
              } else {
                // this.index_status = 4;
                this.indexNode = { ...this.indexNode, status: 4 };
                this.getNodeSubmitRecord(this.indexNode.id, true);
              }
              // this.translate();
              this.cdr.detectChanges();
            },
            (e) => {
              this.isError.ifError(e.code);
            }
          );
        }
      });
  }

  /**支付保证金 */

  pay(): void {
    this.modal
      .open(PopTips, ['是否支付保证金？', true])
      .afterClosed()
      .subscribe((is) => {
        if (is) {
          this.commissionApi
            .createOrder(this.detail.getCommissionId())
            .subscribe(
              (s) => {
                this.router.navigate(['/pay'], {
                  queryParams: {
                    tradeId: s.payId,
                  },
                  queryParamsHandling: 'merge',
                });
              },
              (e) => {
                this.isError.ifError(e.code);
              }
            );
          // 改变node状态 支付前加支付中页面
        }
      });
  }

  /**提交节点 */
  submit(): void {
    if (this.fileList.length > 0 || this.imageList.length > 0) {
      if (this.detail.commissionStatus$.value === 2) {
        let list = [];
        if (this.fileList.length > 0) {
          this.fileList.forEach((l) => {
            list.push(l.token);
          });
        } else {
          this.imageList.forEach((l) => {
            list.push(l.token);
          });
        }

        this.commissionApi.nodeSubmit(this.indexNode.id, list).subscribe(
          (_) => {
            this.imageList = [];
            list = [];
            // 改变node状态
            // this.index_status = 1;
            this.indexNode = { ...this.indexNode, status: 1 };
            this.dataList[this.active].status = 1;
            this.getNodeSubmitRecord(this.indexNode.id, true);
            this.cdr.detectChanges();
          },
          (e) => {
            this.isError.ifError(e.code);
          }
        );
      } else {
        this.modal.open(PopTips, ['企划处于非进行状态，无法操作！', false]);
      }
    } else {
      this.modal.open(PopTips, ['请上传图片/文件！', false]);
    }
  }

  /**节点审核(传入参数p:1 审核通过；p:2 驳回；p:3 退回修改；)     驳回理由、文件列表可选填 */

  audit(p: number): void {
    if (this.detail.commissionStatus$.value === 2) {
      if (p != 1) {
        if (p === 3 && this.modifyCount === 0) {
          this.modal.open(PopTips, [
            '退回修改次数为0，无法发起退回修改。',
            false,
          ]);
        } else if (p === 2 && this.indexNode.rejectCount === 0) {
          this.modal.open(PopTips, ['驳回次数为0，无法发起驳回。', false]);
        } else {
          this.modal
            .open(CommissionReject, {
              type: p,
              c: this.detail.getDetailValue().commission.category,
            })
            .afterClosed()
            .subscribe((i) => {
              if (i) {
                if (i[1]) {
                  this.commissionApi
                    .nodeAudit(this.indexNode.id, p, i[0], i[1])
                    .subscribe(
                      (_) => {
                        // this.index_status = 4;
                        this.indexNode = { ...this.indexNode, status: 4 };
                        this.dataList[this.active].status = 4;
                        this.getNodeSubmitRecord(this.indexNode.id, true);
                        if (p === 3) {
                          this.modifyCount = this.modifyCount - 1;
                        } else if (p === 2) {
                          this.indexNode.rejectCount =
                            this.indexNode.rejectCount - 1;
                        }
                        this.cdr.detectChanges();
                      },
                      (e) => {
                        this.isError.ifError(e.code);
                      }
                    );
                } else {
                  this.commissionApi
                    .nodeAudit(this.indexNode.id, p, i[0])
                    .subscribe(
                      (_) => {
                        // this.index_status = 4;
                        this.indexNode = { ...this.indexNode, status: 4 };
                        this.dataList[this.active].status = 4;
                        this.getNodeSubmitRecord(this.indexNode.id, true);
                        if (p === 3) {
                          this.modifyCount = this.modifyCount - 1;
                        } else if (p === 2) {
                          this.indexNode.rejectCount =
                            this.indexNode.rejectCount - 1;
                        }
                        this.cdr.detectChanges();
                      },
                      (e) => {
                        this.isError.ifError(e.code);
                      }
                    );
                }
              }
            });
        }
      } else {
        this.modal
          .open(PopTips, [
            this.indexNode.type === 1
              ? '是否确认绑定文件无误？'
              : '是否确认审核通过此阶段节点？',
            true,
          ])
          .afterClosed()
          .subscribe((is) => {
            if (is) {
              if (this.active != this.lastNode) {
                this.commissionApi.nodeAudit(this.indexNode.id, p).subscribe(
                  (_) => {
                    // this.index_status = 3;
                    this.dataList[this.active].status = 3;

                    this.active++;
                    this.showIndex = this.active;
                    // this.showTitle = this.dataList[this.active]?.name;
                    // this.index_status = this.dataList[this.active]?.status;
                    // this.index_type = this.dataList[this.active]?.type;
                    // this.nodeId = this.dataList[this.active]?.id;

                    this.indexNode = this.dataList[this.showIndex];
                    this.indexNode = { ...this.indexNode, status: 3 };

                    this.router.navigate([], {
                      queryParams: {
                        node: this.indexNode.id,
                      },
                      queryParamsHandling: 'merge',
                    });
                    this.cdr.detectChanges();
                  },
                  (e) => {
                    this.isError.ifError(e.code);
                  }
                );
              } else {
                this.commissionApi
                  .cancelOrders(this.detail.getCommissionId())
                  .subscribe(
                    (o) => {
                      this.commissionApi
                        .nodeAudit(this.indexNode.id, p)
                        .subscribe(
                          (_) => {
                            // this.index_status = 3;
                            this.indexNode = { ...this.indexNode, status: 3 };
                            this.active = -1;
                            this.commissionApi
                              .commissionStatus(this.detail.getCommissionId())
                              .subscribe((s) => {
                                this.detail.commissionStatus$.next(s.status);
                              });
                            this.detail.setCurrentNodeRate(
                              this.dataList[this.active]?.rate
                            );

                            this.router.navigate([], {
                              queryParams: {
                                node: this.indexNode.id,
                              },
                              queryParamsHandling: 'merge',
                            });
                            this.cdr.detectChanges();
                          },
                          (e) => {
                            this.isError.ifError(e.code);
                          }
                        );
                    },
                    (e) => {
                      this.isError.ifError(e.code);
                    }
                  );
              }
            }
          });
      }
    } else {
      this.modal.open(PopTips, ['企划处于非进行状态，无法操作！', false]);
    }
  }

  /**超时中止 */

  discontinue(): void {
    this.commissionApi.cancelOrders(this.detail.getCommissionId()).subscribe(
      (_) => {
        // this.commissionApi.discontinue(this.detail.getCommissionId(), 3).subscribe(_ => {
        //     //改变node状态

        //     // this.index_status = 4;
        //     this.modal.open(PopTips, ['超时中止发起成功', false, 1]).afterClosed().subscribe(w => {

        //         this.commissionApi.commissionStatus(this.detail.getCommissionId()).subscribe(s => {
        //             this.detail.commissionStatus$.next(s.status);
        //         })
        //         this.cdr.detectChanges();
        //     })

        // }, e => {
        //     this.isError.ifError(e.code);
        // })
        this.modal
          .open(CommissionTimeout, {
            type: 3,
            id: this.detail.getCommissionId(),
            identity: this.detail.getIdentity(),
            isSponsorTimeout: this.isSponsorTimeout(),
            detail: this.detail.getDetailValue(),
            rate: this.detail.getCurrentNodeRate(),
          })
          .afterClosed()
          .subscribe((s) => {
            if (s) {
              this.modal
                .open(PopTips, ['超时中止发起成功', false, 1])
                .afterClosed()
                .subscribe((w) => {
                  this.commissionApi
                    .commissionStatus(this.detail.getCommissionId())
                    .subscribe((i) => {
                      this.detail.commissionStatus$.next(i.status);
                    });
                  this.cdr.detectChanges();
                });
            }
          });
      },
      (e) => {
        this.isError.ifError(e.code);
      }
    );
  }

  /**编辑企划 */
  edit(): void {
    this.router.navigate(
      [
        this.detail.getDetailValue().commission.category === 1
          ? '/commission/publish/illust'
          : '/commission/publish/live2d',
      ],
      {
        queryParams: {
          cid: this.detail.getCommissionId(),
        },
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
