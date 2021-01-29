import { Component, Inject, OnInit } from '@angular/core';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'ivo-commission-painter',
	templateUrl: './commission-painter.html',
	styleUrls: ['./commission-painter.less'],
})
export class CommissionPainter implements OnInit {
	// 身份(当企划未选定画师是为0)
	Identity: number;

	category: string;

	type$ = new BehaviorSubject(0);
	constructor(
		private modalRef: ModalRef<CommissionPainter>,
		@Inject(MODAL_DATA_TOKEN)
		public k: {
			type: number;
			price: number;
			day: number;
			nickname: string;
			start: number;
			avatar: string;
			identity: number;
			category: number;
		}
	) {}

	ngOnInit(): void {
		this.type$.next(this.k.type);
		this.Identity = this.k.identity;
		if (this.k.category === 0) {
			this.category = '模型师';
		} else {
			this.category = '画师';
		}
	}

	cancel(): void {
		this.modalRef.close();
	}

	sure(): void {
		this.modalRef.close(1);
	}
}
