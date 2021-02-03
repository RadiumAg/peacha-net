import { Component, QueryList, Input, ContentChildren, DoCheck } from '@angular/core';
import { ErrorDisplayCase } from './error-display-case';
import { AbstractControl } from '@angular/forms';

@Component({
	selector: '*[errorDisplay]',
	template: `<ng-content></ng-content>`,
})
export class ErrorDisplay implements DoCheck {
	@ContentChildren(ErrorDisplayCase) cases: QueryList<ErrorDisplayCase>;
	@Input() errorDisplay: AbstractControl;

	ngDoCheck() {
		if (!this.errorDisplay) {
			return;
		}
		const cont = this.errorDisplay;
		if (!cont.touched) {
			return;
		}
		let errorDisplayed = false;
		this.cases?.forEach((ca, i, a) => {
			ca.vc.clear();
			if (!errorDisplayed) {
				if (cont.hasError(ca.case)) {
					errorDisplayed = true;
					ca.vc.createEmbeddedView(ca.template);
				}
			}
		});
	}
}
