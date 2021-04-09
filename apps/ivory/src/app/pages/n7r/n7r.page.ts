import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { ModalService } from '@peacha-core';
import { N7rGoodDetail } from './components/good-detail/good-detail';
import { N7rPlay } from './components/play/play';
import { N7rApiService } from './n7r-api.service';

@Component({
	selector: 'ivo-n7r',
	templateUrl: './n7r.page.html',
	styleUrls: ['./n7r.page.less'],
	animations: [
		trigger('imgMove', [
			/** 不显示 */
			state('off', style({ display: 'none', 'z-index': '0', transform: 'translateX(0)' })),
			/** 上一张图片 */
			state(
				'prev',
				style({
					'z-index': '1',
					transform: 'translateX(-100%)',
				})
			),
			/** 下一张图片 */
			state('next', style({ 'z-index': '2', transform: 'translateX(100%)' })),
			/** 当前图片 */
			state('on', style({ 'z-index': '7', transform: 'translateX(0)' })),
			transition('prev=>on', [animate('0.3s ease-in')]),
			transition('next=>on', [animate('0.3s ease-in')]),
			transition('on=>prev', [animate('0.3s ease-in')]),
			transition('on=>next', [animate('0.3s ease-in')]),
		]),
	],
})
export class N7rPage {
	constructor(
		private modal: ModalService,
		private n7rApi: N7rApiService
	) {

	}


	preOrder(type: number): void {
		this.n7rApi.goodsList().subscribe(good => {
			this.modal.open(N7rGoodDetail, { type, good })
		})

	}

	toPlay(type: number): void {
		this.modal.open(N7rPlay, type);
	}
}
