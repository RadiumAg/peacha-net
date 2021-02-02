import { Injectable } from '@angular/core';
import { ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';


@Injectable()
export class CommissionDetailErrorService {
	constructor(private modal: ModalService) { }

	/**错误处理 */
	ifError(e: number): void {
		switch (e) {
			case 135:
				this.modal.open(PopTips, ['文件已过期，请重新上传', false]);
				break;
			case 408:
				this.modal.open(PopTips, ['', false]);
				break;
			case 404:
				this.modal.open(PopTips, ['目前无法操作企划', false]);
				break;
			case 10701:
				this.modal.open(PopTips, ['企划不存在', false]);
				break;
			case 10702:
				this.modal.open(PopTips, ['已选中画师', false]);
				break;
			case 10703:
				this.modal.open(PopTips, ['企划进行中', false]);
				break;
			case 10704:
				this.modal.open(PopTips, ['企划状态异常，暂无法发起确认', false]);
				break;
			case 10706:
				this.modal.open(PopTips, ['已上传', false]);
				break;
			case 10711:
				this.modal.open(PopTips, ['企划存在中止，请前往中止记录查看', false]);
				break;
			case 10713:
				this.modal.open(PopTips, ['修改次数上限', false]);
				break;
			case 10714:
				this.modal.open(PopTips, ['驳回次数上限', false]);
				break;
			case 10721:
				this.modal.open(PopTips, ['申请不存在', false]);
				break;
			case 10722:
				this.modal.open(PopTips, ['无法发起超时中止', false]);
				break;
			case 10742:
				this.modal.open(PopTips, ['重复提交', false]);
				break;
			case 10751:
				this.modal.open(PopTips, ['存在未支付订单', false]);
				break;
		}
	}
}
