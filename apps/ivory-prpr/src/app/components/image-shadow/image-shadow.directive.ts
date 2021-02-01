import {
    Component,
    OnInit,
    Directive,
    Renderer2,
    ElementRef,
    HostListener,
} from '@angular/core';

@Directive({
    selector: '[ivo-image-shadow]',
})
export class ImageShadowDirective implements OnInit {
    constructor(private el: ElementRef, private re2: Renderer2) {}
    @HostListener('mouseover', ['$event'])
    hover(e: Event) {
        this.re2.setStyle(
            this.el.nativeElement,
            'box-shadow',
            ' 0px 0px 16px 0 rgba(0, 0, 0, 0.08)'
        );
    }

    @HostListener('mouseout', ['$event'])
    out(e: Event) {
        this.re2.setStyle(this.el.nativeElement, 'box-shadow', '');
    }

    ngOnInit(): void {}
}
