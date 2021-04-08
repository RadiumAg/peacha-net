import { Component } from '@angular/core';
import { ModalService } from '@peacha-core';
import { N7rGoodDetail } from './components/good-detail/good-detail';
import { N7rPlay } from './components/play/play';
import { N7rApiService } from './n7r-api.service';

@Component({
	selector: 'ivo-n7r',
	templateUrl: './n7r.page.html',
	styleUrls: ['./n7r.page.less'],
})
export class N7rPage {
	constructor(
		private modal: ModalService,
		private n7rApi: N7rApiService
	) {

	}


	preOrder(): void {
		// this.n7rApi.goodsList().subscribe(s => {
		// 	console.log(s)
		// })
		this.modal.open(N7rGoodDetail)
	}

	toPlay(type: number): void {
		this.modal.open(N7rPlay, type);
	}
}
