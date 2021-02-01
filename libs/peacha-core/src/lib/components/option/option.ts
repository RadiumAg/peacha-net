import { Component, HostListener, Input, Inject } from '@angular/core';
import { SelectFather, SELECT_FATHER } from '../select/selectfather';

@Component({
	selector: 'ivo-option',
	templateUrl: './option.html',
	styleUrls: ['./option.less'],
})
export class Option {
	constructor(@Inject(SELECT_FATHER) public select: SelectFather) { }
	@Input() value: number;
	@Input() text: string;
	@Input() selected?: boolean;
	@Input() borderStyle?: number;

	@HostListener('click')
	click() {
		this.select.onOptionClick(this);
	}
}
