import { Component, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';
import { PopTips } from '@peacha-core/components';

@Component({
	selector: 'ivo-can-not',
	templateUrl: './can-not.html',
	styleUrls: ['./can-not.less'],
})
export class CanNot {
	constructor(private modalRef: ModalRef<PopTips>, @Inject(MODAL_DATA_TOKEN) public keyWords: number, private router: Router) {
		this.tips$.next(this.keyWords);
	}

	tips$ = new BehaviorSubject<number>(0);
	sure() {
		this.modalRef.close(1);
	}
	toOrder() {
		this.router.navigate(['/setting/order']);
		this.modalRef.close();
	}
	toCart() {
		this.router.navigate(['/cart']);
		this.modalRef.close();
	}
}
