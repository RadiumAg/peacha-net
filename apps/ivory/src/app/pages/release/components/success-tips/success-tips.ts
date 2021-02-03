import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ModalRef, MODAL_DATA_TOKEN } from '@peacha-core';

@Component({
	selector: 'ivo-success-tips',
	templateUrl: './success-tips.html',
	styleUrls: ['./success-tips.less'],
})
export class SuccessTips implements OnDestroy {
	redirectSet = 5;
	count$: BehaviorSubject<number>;

	@Input()
	redirectUrl: string;

	tips$ = new BehaviorSubject<string>('');
	timer: any;

	constructor(private router: Router, private modalRef: ModalRef<SuccessTips>, @Inject(MODAL_DATA_TOKEN) public key: any) {
		this.count$ = new BehaviorSubject<number>(this.redirectSet);
		this.tips$.next(key.tip);
		this.timer = setInterval(() => {
			//console.log(this.redirectSet);
			if (!this.redirectSet) {
				this.router.navigateByUrl(this.key.redirectUrl);
				clearInterval(this.timer);
				this.modalRef.close();
				return;
			}
			this.count$.next(--this.redirectSet);
		}, 1000);
	}

	sure() {
		this.router.navigateByUrl(this.key.redirectUrl);
		this.modalRef.close();
	}

	cancel() {
		this.modalRef.close();
	}

	ngOnDestroy(): void {
		clearInterval(this.timer);
	}

}
