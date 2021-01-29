import { Directive, Input, HostBinding, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
	selector: '[errorCase]',
})
export class ErrorDisplayCase {
	constructor(public template: TemplateRef<any>, public vc: ViewContainerRef) {}

	@Input('errorCase') case: string;
}
