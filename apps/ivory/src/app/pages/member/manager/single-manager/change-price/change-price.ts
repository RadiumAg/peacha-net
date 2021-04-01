import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MODAL_DATA_TOKEN } from '@peacha-core';
import { ModalRef } from '@peacha-core/services';


@Component({
    selector: 'ivo-change-price',
    templateUrl: './change-price.html',
    styleUrls: ['./change-price.less'],
})
export class ChangePrice {

    constructor(
        private modalRef: ModalRef<ChangePrice>,
        @Inject(MODAL_DATA_TOKEN) public work: {
            price: number, name: string
        }
    ) { }

    money = new FormControl('', [Validators.required, Validators.pattern('^[1-9]\\d*$'), Validators.max(999999)]);

    cancel(): void {
        this.modalRef.close();
    }

    sure(): void {
        if (this.money.valid) {
            this.modalRef.close(this.money.value);
        }
    }
}