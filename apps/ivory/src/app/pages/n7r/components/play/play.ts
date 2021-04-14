import { Component, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';



@Component({
    selector: 'ivo-n7r-play',
    templateUrl: './play.html',
    styleUrls: ['./play.less']
})
export class N7rPlay {

    safeUrl: any;
    constructor(
        private modalRef: ModalRef<N7rPlay>,
        @Inject(MODAL_DATA_TOKEN) public type: number,
        private sanitizer: DomSanitizer
    ) {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            'https://player.bilibili.com/player.html?bvid='
            + (this.type === 1 ? 'BV1Rs411q7bC' : this.type === 2 ? 'BV1Ms411J7tL' : this.type === 3 ? 'BV1yb411W7rB' : 'BV1pt4y1S7zr')
            + '&page=1&as_wide=1&high_quality=1&danmaku=0');

    }


    close(): void {
        this.modalRef.close();
    }

}
