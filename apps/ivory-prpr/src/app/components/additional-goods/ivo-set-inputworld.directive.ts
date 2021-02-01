import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
    selector: '[ivoIvoSetInputworld]',
})
export class IvoSetInputworldDirective {
    target: ElementRef<any>;

    @Input('ivoIvoSetInputworld')
    set word(word: string) {
        let worldSpan = this.re2.createElement('span');
        this.re2.setProperty(worldSpan, 'innerHtml', word);
        this.re2.addClass(worldSpan, 'world');
        let parentNode = this.re2.parentNode(this.target.nativeElement);
        this.re2.appendChild(parentNode,this.target.nativeElement);
        //console.log("插入world");
    }

    constructor(private el: ElementRef, private re2: Renderer2) {
        this.target = el;
    }
}
