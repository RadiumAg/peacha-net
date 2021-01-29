import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ZoomService } from '@peacha-core';
import { IllustZoomModalComponent } from '../../../work/illust-zoom-modal/illust-zoom-modal.component';
import { CommissionNodeComponent } from '../../components/commission-node/commission-node.component';
import { CommissionDetail } from '../../model/commission-detail';
import { CommissionDetailService } from '../../service/detail.service';

@Component({
	selector: 'ivo-commission-detail-needs',
	templateUrl: './commission-detail-needs.page.html',
	styleUrls: ['./commission-detail-needs.page.less'],
})
export class CommissionDetailNeedsPage implements OnInit, AfterViewInit {
	@ViewChild('node') node: CommissionNodeComponent;

	detail: CommissionDetail;

	category: number;

	commissionId: number;

	constructor(private stateDetail: CommissionDetailService, private zoom: ZoomService) {}

	ngOnInit(): void {
		this.detail = this.stateDetail.getDetailValue();
		this.category = this.stateDetail.getDetailValue().commission.category;
		this.commissionId = this.stateDetail.getCommissionId();
	}

	ngAfterViewInit(): void {
		if (this.detail.commission.category === 1) {
			const arr = [];
			this.stateDetail.getDetailValue().nodeList.forEach(l => {
				const i = { n: l.name, r: l.rate * 100 };
				arr.push(i);
			});
			this.node.writeValue(arr);
		}
	}

	toUpdate(u: string): void {
		window.open(u);
	}

	showDetail(data: string): void {
		this.zoom.open(IllustZoomModalComponent, {
			assets: [data],
			index: 0,
		});
	}
}
