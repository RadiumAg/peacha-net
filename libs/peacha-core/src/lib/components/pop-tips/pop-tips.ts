import { Component, Inject } from '@angular/core';
import { ModalRef } from '../../core/service/modals.service';
import { MODAL_DATA_TOKEN } from '../../core/tokens';

export const PopTipsIcons = {
	Pass: '/assets/image/pop-tips/pass.svg',
	Error: '/assets/image/pop-tips/error.svg',
	Worning: '/assets/image/pop-tips/worning.svg',
};

@Component({
	selector: 'ivo-pop-tips',
	templateUrl: './pop-tips.html',
	styleUrls: ['./pop-tips.less'],
})
export class PopTips {
	tips: string;
	bool: boolean;
	icon: string;
	sureText: string;

	constructor(private modalRef: ModalRef<PopTips>, @Inject(MODAL_DATA_TOKEN) public keyWords: Array<any>) {
		this.tips = this.keyWords[0] ?? '';
		this.bool = this.keyWords[1] ?? false;
		this.icon = this.keyWords[2] === 0 ? PopTipsIcons.Error : this.keyWords[2] === 1 ? PopTipsIcons.Pass : PopTipsIcons.Worning;
		this.sureText = this.keyWords[3] ?? '确定';
	}

	sure(): void {
		this.modalRef.close(1);
	}
	cancel(): void {
		this.modalRef.close();
	}
}
