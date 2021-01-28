import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ZoomService } from '@peacha-core';
import { IllustZoomModalComponent } from '../../../work/illust-zoom-modal/illust-zoom-modal.component';
import { CommissionApiService } from '../../service/commission-api.service';
import { CommissionDetailService } from '../../service/detail.service';

@Component({
  selector: 'ivo-commission-discontinue-reject-file',
  templateUrl: './commission-discontinue-reject-file.page.html',
  styleUrls: ['./commission-discontinue-reject-file.page.less'],
})
export class CommissionDiscontinueRejectFilePage implements OnInit {
  fileList: {
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

  commissionType: number;
  constructor(
    private api: CommissionApiService,
    private detail: CommissionDetailService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private zoom: ZoomService
  ) {}

  ngOnInit(): void {
    this.commissionType = this.detail.getDetailValue().commission.category;
    this.api
      .discontinueFileRecords(this.detail.getCommissionId())
      .subscribe((s) => {
        this.fileList = s.list.filter((l) => l.status === 2);
        this.cdr.detectChanges();
      });
  }

  goback(): void {
    this.router.navigate(['/commission/detail/discontinue'], {
      queryParamsHandling: 'merge',
    });
  }

  showDetail(data: string): void {
    this.zoom.open(IllustZoomModalComponent, {
      assets: [data],
      index: 0,
    });
  }
}
