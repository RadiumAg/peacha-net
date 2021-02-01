import { Component, Inject } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';

@Component({
    selector: 'ivo-pop-tips',
    templateUrl: './pop-tips.html',
    styleUrls: ['./pop-tips.less'],
})

export class PopTips {
    constructor(private modalRef: ModalRef<PopTips>, @Inject(MODAL_DATA_TOKEN) public keyWords: Array<any>) {
        this.tips$.next(this.keyWords[0]);
        this.bool$.next(this.keyWords[1]);
        this.icon$.next(this.keyWords[2] === 0 ? '/assets/image/pop-tips/error.svg' : this.keyWords[2] === 1 ? '/assets/image/pop-tips/pass.svg' : '/assets/image/pop-tips/worning.svg')
    }

    tips$ = new BehaviorSubject<string>('');
    bool$ = new BehaviorSubject<boolean>(false);
    icon$ = new BehaviorSubject('/assets/image/pop-tips/worning.svg');

    sure() {
        this.modalRef.close(1);
    }
    cancel() {
        this.modalRef.close();
    }
}
