import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ModalRef } from '@peacha-core';
import { MODAL_DATA_TOKEN } from 'libs/peacha-core/src/lib/core/tokens';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'ivo-modify-scale',
	templateUrl: './modify-scale.html',
	styleUrls: ['./modify-scale.less'],
})
export class ModifyScale {
	@ViewChild('inputNum') num: ElementRef;
	number$ = new BehaviorSubject<number>(0);
	constructor(private modalRef: ModalRef<ModifyScale>, @Inject(MODAL_DATA_TOKEN) public n: number) {
		this.number$.next(n);
		this.shownum = n * 100;
	}

	cancel() {
		this.modalRef.close();
	}
	sure() {
		this.modalRef.close(this.number$.value);
	}

	shownum = 0;

	setPrecent(num: { process: number }) {
		this.shownum = Number((num.process * 100).toFixed(0));
		this.number$.next(Number(num.process.toFixed(2)));
	}
}
