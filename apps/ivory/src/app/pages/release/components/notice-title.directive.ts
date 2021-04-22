import { Directive,ElementRef,Input,Renderer2,AfterViewInit } from '@angular/core';

@Directive({
	selector: '[ivoNoticeTitle]',
})
export class NoticeTitleDirective implements AfterViewInit {
	@Input() ivoNoticeTitle: string;
	@Input() marginLeft = '20';

	constructor(private el: ElementRef,private re2: Renderer2) { }

	/**
	 * @description 设置节点
	 */
	private setElement() {
		const titleSpan = this.re2.createElement('span');
		this.re2.setProperty(titleSpan,'innerText',this.ivoNoticeTitle);
		this.re2.setAttribute(
			titleSpan,
			'style',
			`font-weight:400;
             line-height:18px;
             margin-left:${this.marginLeft}px;
             font-size:12px;
             align-self: stretch;
             display: flex;
			 user-select:none;
             align-items: center;
             color:rgba(153,153,153,1);`
		);
		this.re2.setAttribute(this.el.nativeElement,'style',`display: flex;`);
		this.re2.appendChild(this.el.nativeElement,titleSpan);
	}

	ngAfterViewInit(): void {
		this.setElement();
	}

}
