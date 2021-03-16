import { Component, Inject } from '@angular/core';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';

@Component({
    selector: 'ivo-commission-prompt',
    templateUrl: './commission-prompt.html',
    styleUrls: ['./commission-prompt.less'],
})
export class CommissionPrompt {

    constructor(
        private modalRef: ModalRef<CommissionPrompt>,
        @Inject(MODAL_DATA_TOKEN) public key: { title: string; tips: string, type?: boolean }
    ) {
    }


    cancel(): void {
        this.modalRef.close();
    }

    sure(): void {
        this.modalRef.close(1);
    }
}
