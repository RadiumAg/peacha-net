
import {
    OnInit,
    ElementRef,
    Renderer2,
    Directive,
    HostListener,
} from '@angular/core';

@Directive({
    selector: '[ivo-button]',
    host: {
        style: `background-color: #FF6398;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s ease 0s;`,
    },
})
export class Button implements OnInit {
    constructor(private el: ElementRef, private re2: Renderer2) {}
    @HostListener('mouseover', ['$event'])
    hover(e: Event) {
        this.re2.setStyle(
            this.el.nativeElement,
            'background-color',
            '#FFA5C3'
        );
    }
    @HostListener('mouseout', ['$event'])
    out(e: Event) {
        this.re2.setStyle(this.el.nativeElement, 'background-color', '#FF6398');
    }
    ngOnInit(): void {}
}
