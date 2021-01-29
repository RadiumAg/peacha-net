import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ModalRef } from '@peacha-core';

@Component({
	selector: 'ivo-commission-addmoney',
	templateUrl: './commission-addmoney.html',
	styleUrls: ['./commission-addmoney.less'],
})
export class CommissionAddmoney implements OnInit {
	addMoneyForm: FormGroup;
	constructor(private modalRef: ModalRef<CommissionAddmoney>, private fb: FormBuilder) {
		this.addMoneyForm = this.fb.group(
			{
				money: new FormControl('', [Validators.required, Validators.pattern('^[1-9][0-9]*0{1}$')]),
				text: new FormControl('', [Validators.required, Validators.maxLength(100)]),
			},
			{ validators: this.formValidator }
		);
	}

	formValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
		if (!control.get('text').value || !control.get('money').value) {
			return { invaild: true };
		} else {
			return {};
		}
	};
	get money(): AbstractControl {
		return this.addMoneyForm.get('money');
	}

	get text(): AbstractControl {
		return this.addMoneyForm.get('text');
	}

	ngOnInit(): void {}

	cancel(): void {
		this.modalRef.close();
	}

	sure(): void {
		if (this.addMoneyForm.valid) {
			this.modalRef.close({
				money: this.money.value / 10,
				text: this.text.value,
			});
		}
	}
}
