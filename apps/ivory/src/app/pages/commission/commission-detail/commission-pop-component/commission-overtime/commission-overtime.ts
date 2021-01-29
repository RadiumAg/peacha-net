import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalRef } from '@peacha-core';

@Component({
	selector: 'ivo-commission-overtime',
	templateUrl: './commission-overtime.html',
	styleUrls: ['./commission-overtime.less'],
})
export class CommissionOvertime implements OnInit {
	addtime = new FormControl('', [Validators.required, Validators.pattern('^[1-9]([0-9])?$')]);

	constructor(private modalRef: ModalRef<CommissionOvertime>) {}

	ngOnInit(): void {}

	cancel(): void {
		this.modalRef.close();
	}

	sure(): void {
		if (this.addtime.valid) {
			this.modalRef.close(this.addtime.value);
		}
	}
}
