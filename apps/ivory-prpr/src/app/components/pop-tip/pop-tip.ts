import { Component, Inject } from '@angular/core';
import { ModalRef } from 'src/app/core/service/modals.service';
import { MODAL_DATA_TOKEN } from 'src/app/core/tokens';

@Component({
    selector: 'ivo-pop-tips',
    templateUrl: './pop-tip.html',
    styleUrls: ['./pop-tip.less'],
})
export class PopTip {
    constructor(
        private modalRef: ModalRef<PopTip>,
        @Inject(MODAL_DATA_TOKEN) public keyWords: string
    ) {}

    sure() {
        this.modalRef.close(1);
    }
    cancel(){
        this.modalRef.close();
    }
}
