import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalRef } from '@peacha-core';


@Component({
	selector: 'ivo-submit-success',
	templateUrl: './submit-success.html',
	styleUrls: ['./submit-success.less'],
})
export class SubmitSuccess {
	constructor(private router: Router, private modalRef: ModalRef<SubmitSuccess>) { }
	sure() {
		this.modalRef.close();
		this.router.navigate(['/setting/wallet']);
	}
}
