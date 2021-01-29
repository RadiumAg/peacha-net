import { Component, OnInit, AfterViewInit, AfterViewChecked, AfterContentInit, Input, AfterContentChecked } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'ivo-footer',
	templateUrl: './footer.fragment.html',
	styleUrls: ['./footer.fragment.less'],
	host: {
		'[class.footer-position]': `isAbsoulte`,
	},
})
export class FooterFragment implements AfterContentChecked {
	isAbsoulte = false;
	constructor() {}

	ngAfterContentChecked(): void {
		// this.isAbsoulte = !this.hasScroll();
	}

	private hasScroll(): boolean {
		return document.body.scrollHeight > document.documentElement.clientHeight;
	}
}
