import {
    Component,
    OnInit,
    ContentChildren,
    QueryList,
    ViewChild,
    TemplateRef,
    ViewContainerRef,
    forwardRef,
    ElementRef,
    Input,
    Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Option } from '../option/option';
import { Overlay, CdkOverlayOrigin, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { Subject, BehaviorSubject, of } from 'rxjs';
import { SelectAnimations } from './select.animations';
import { SelectFather, SELECT_FATHER } from './selectfather';

export const EXE_COUNTER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Select),
    multi: true,
};

@Component({
    selector: 'ivo-select',
    templateUrl: './select.html',
    styleUrls: ['./select.less'],
    providers: [
        EXE_COUNTER_VALUE_ACCESSOR,
        {
            provide: SELECT_FATHER,
            useExisting: Select,
        },
    ],
    animations: [SelectAnimations.transformPanel],
})
export class Select implements ControlValueAccessor, SelectFather {
    constructor(private overlay: Overlay, private vc: ViewContainerRef, private render: Renderer2) { }

    @Input()
    disabled = false;
    @ViewChild('hello')
    hello: ElementRef;


    @ViewChild('trigger')
    trigger: ElementRef;

    @ViewChild(CdkOverlayOrigin)
    overlayOrigin: CdkOverlayOrigin;

    @ViewChild('hoverboard')
    hoverboard: TemplateRef<any>;

    @ContentChildren(Option)
    options: QueryList<Option>;

    afterViewInit$ = new Subject();
    selected = false;
    y = 0;

    //_transformOrigin: string = 'top';

    private overlayRef: OverlayRef;

    optionClicked = new BehaviorSubject<any>(undefined);

    onOptionClick(option: Option) {
        this.optionClicked.next(option);
        this.fnOnChange!(option.value);
        this.overlayRef.detach();
        this.selected = false;
        this.y = this.options.toArray().indexOf(option);
    }

    ngAfterContentInit() {
        this.optionClicked.next(this.options.first);
        // this.afterViewInit$.next(1);
        this.afterViewInit$.complete();
    }

    open() {
        this.render.addClass(this.hello?.nativeElement, 'zhuan');
        if (this.disabled) {
            return;
        }
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.overlayOrigin.elementRef)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                    // offsetX:-10
                },
            ]);
        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            hasBackdrop: true,
            backdropClass: 'cdk-backdrop-transparent',
        });
        const portal = new TemplatePortal(this.hoverboard, this.vc);
        this.overlayRef.attach(portal);
        this.overlayRef
            .backdropClick()
            .pipe(takeUntil(this.overlayRef.detachments()))
            .subscribe((_) => {
                this.overlayRef.detach();
                this.render.removeClass(this.hello?.nativeElement, 'zhuan')
            });

        this.selected = true;
    }

    writeValue(v: any) {
        this.afterViewInit$.subscribe(undefined, undefined, () => {
            const option =
                this.options.find((x) => x.value == v) ?? this.options.first;
            if (option) {
                this.optionClicked.next(option);
            }
            setTimeout(() => {
                this.render.removeClass(this.hello?.nativeElement, 'zhuan')
            }, 1);
  


        });
    }

    fnOnChange?: (v: any) => void;
    registerOnChange(fn: any) {
        this.fnOnChange = fn;
    }

    fnOnTouched?: () => void;
    registerOnTouched(fn: any) {
        this.fnOnTouched = fn;
    }
}
