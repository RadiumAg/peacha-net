import { Component, Inject } from '@angular/core';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';



@Component({
    selector: 'ivo-n7r-good-detail',
    templateUrl: './good-detail.html',
    styleUrls: ['./good-detail.less']
})
export class N7rGoodDetail {

    constructor(
        private modalRef: ModalRef<N7rGoodDetail>,
        // @Inject(MODAL_DATA_TOKEN) public type: number
    ) { }


    close(): void {
        this.modalRef.close();
    }

}
