import { Component } from '@angular/core';
import { ModalRef } from '@peacha-core';

@Component({
	selector: 'ivo-certified-tips',
	templateUrl: './certified-tips.component.html',
	styleUrls: ['./certified-tips.component.less'],
})
export class CertifiedTipsComponent {
	constructor(private modal: ModalRef<string>) { }
	close() {
		this.modal.close(1);
	}
}
