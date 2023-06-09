import { NgControl } from '@angular/forms';
import { Directive, ElementRef, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FORM_NAV_TOKEN } from '@peacha-core';

@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[ivoFormNav]',
})
export class FormNavDirective {
	constructor(
		private control: NgControl,
		@Inject(FORM_NAV_TOKEN)
		private form_nav_token: BehaviorSubject<boolean[]>,
		private el: ElementRef
	) {
		const click = () => {
			const controlIndex = (this.el.nativeElement as HTMLElement).getAttribute('data-control-index');
			let oldval = this.form_nav_token.getValue();
			oldval = oldval.map(_x => false);
			if (controlIndex) {
				oldval[controlIndex] = true;
			}
			this.form_nav_token.next(oldval);
		};
		(this.el.nativeElement as HTMLElement).addEventListener('click', click, true);
	}

	// 没有冒泡阶段
	// @HostListener('click', ['$event'])
	// changeNav(e: Event) {
	//     const controlIndex = (this.el
	//         .nativeElement as HTMLElement).getAttribute('data-control-index');
	//     let oldval = this.form_nav_token.getValue();
	//     oldval = oldval.map((x) => false);
	//     if (controlIndex) {
	//         oldval[controlIndex] = true;
	//     }
	//     this.form_nav_token.next(oldval);
	//     console.log(this.form_nav_token.getValue());
	// }
}
