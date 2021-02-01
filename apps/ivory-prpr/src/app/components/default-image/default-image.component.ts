import { style } from '@angular/animations';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    ElementRef,
    Input,
} from '@angular/core';

@Component({
    // tslint:disable-next-line: component-selector
    selector: '[ivo-defaultImage]',
    exportAs: 'ivoDefaultImage',
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: '',
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        '(error)': 'error()',
    },
})
export class DefaultImageComponent implements OnInit {
    constructor(private elementRef: ElementRef<HTMLElement>) {}
    @Input() errorImage: string;
    error() {
        (this.elementRef
            .nativeElement as HTMLImageElement).src = this.errorImage;
    }
    ngOnInit(): void {}
}
