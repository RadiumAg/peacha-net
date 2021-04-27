import { Component, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';

@Component({
	selector: 'ivo-n7r-play',
	templateUrl: './play.html',
	styleUrls: ['./play.less'],
})
export class N7rPlay {
	safeUrl: any;
	constructor(private modalRef: ModalRef<N7rPlay>, @Inject(MODAL_DATA_TOKEN) public type: number, private sanitizer: DomSanitizer) {
		this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
			'https://player.bilibili.com/player.html?bvid=' + (this.type === 1 ? 'BV1Ft4y1z7yX' : 'BV1Nf4y1t7De')
		);
	}

	close(): void {
		this.modalRef.close();
	}
}
