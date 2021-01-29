import { Component, Renderer2, ViewContainerRef, Input, AfterViewChecked } from '@angular/core';

@Component({
	selector: 'ivo-cursor',
	styleUrls: ['./cursor.component.less'],
	template: '',
})
export class CursorComponent implements AfterViewChecked {
	constructor(private el: ViewContainerRef, private re2: Renderer2) {}

	@Input() activeClassName = 'active';
	oldLeft = 0;
	oldWidth = 0;
	flag = false;
	ngAfterViewChecked(): void {
		const child = (this.el.element.nativeElement as HTMLElement).previousElementSibling.children;
		this.flag = false;
		for (let i = 0; i < child.length; i++) {
			const childElement = child.item(i) as HTMLElement;
			if (!(childElement as HTMLLinkElement)) {
				continue;
			}
			this.init(childElement);
			this.re2.listen(childElement, 'click', (e: Event) => {
				const target = e.target as HTMLElement;
				this.oldLeft = target.offsetLeft;
				this.oldWidth = target.offsetWidth;
				this.setLinkStyle(target);
			});
			this.re2.listen(childElement, 'mouseover', (e: Event) => {
				const target = e.target as HTMLElement;
				this.setLinkStyle(target);
			});
			this.re2.listen(childElement, 'mouseout', (e: Event) => {
				const target = e.target as HTMLElement;
				this.setLinkOutStyle(this.oldLeft, this.oldWidth);
			});
		}

		this.isHidden();
	}

	private isHidden() {
		if (this.flag) {
			(this.el.element.nativeElement as HTMLElement).hidden = false;
		} else {
			(this.el.element.nativeElement as HTMLElement).hidden = true;
		}
	}

	/**
	 * @description 初始化
	 * @private
	 * @param {HTMLElement} childElement
	 * @memberof CursorComponent
	 */
	private init(childElement: HTMLElement) {
		if (childElement.className.includes(this.activeClassName)) {
			this.flag = true;
			this.setLinkStyle(childElement);
			this.oldLeft = childElement.offsetLeft;
			this.oldWidth = childElement.offsetWidth;
		}
	}

	/**
	 * @description 设置样式
	 * @private
	 * @param {Event} e
	 * @memberof CursorComponent
	 */
	private setLinkStyle(element: HTMLElement) {
		this.re2.setStyle(this.el.element.nativeElement, 'left', element.offsetLeft + 'px');
		this.re2.setStyle(this.el.element.nativeElement, 'width', element.offsetWidth + 'px');
	}

	/**
	 *
	 * @private
	 * @param {number} oldLeft
	 * @param {number} oldWidth
	 * @memberof CursorComponent
	 */
	private setLinkOutStyle(oldLeft: number, oldWidth: number) {
		this.re2.setStyle(this.el.element.nativeElement, 'left', oldLeft + 'px');
		this.re2.setStyle(this.el.element.nativeElement, 'width', oldWidth + 'px');
	}
}
