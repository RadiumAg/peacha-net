import {
    Component,
    Input,
    Output,
    Renderer2,
    ViewContainerRef,
    EventEmitter,
    ViewChild,
    ElementRef,
} from '@angular/core';
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    FormBuilder,
    Validators,
} from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { validator } from 'src/app/core/commom/common';

@Component({
    selector: 'ivo-additional',
    templateUrl: './additional.component.html',
    styleUrls: ['./additional.component.less'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: AdditionalComponent,
            multi: true,
        },
    ],
})
export class AdditionalComponent implements ControlValueAccessor {
    updata: (o: object) => void;
    @ViewChild('price', { read: ElementRef })
    price: ElementRef;

    @ViewChild('title', { read: ElementRef })
    title: ElementRef;
    isChecked = false;
    get = 0;
    title$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    price$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    nError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    pError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    /**
     * @description 是否显示删除按钮
     */
    @Input() isDelete = false;
    @Input() wordNumber = 15;
    @Input() wordCount = 0;
    @Input() canUpload = true;
    @Input() index = 0;
    @Input() canDelete = false;
    @Input() isResertBeforeUpload = false;
    @Input() buttonWord = '';
    @Input() canInputPrice = true;
    @Input() canInputTitle = true;
    @Input() handlingRate = 0;
    @Output()
    uploadData: EventEmitter<any> = new EventEmitter();

    @Output()
    delete: EventEmitter<any> = new EventEmitter<any>();
    constructor(
        private re2: Renderer2,
        private vcf: ViewContainerRef,
        private fb: FormBuilder
    ) {}

    upload = this.fb.group({
        f: ['', Validators.required],
        additionalId: [''],
    });

    summeryData$: Observable<any>;

    writeValue(goods: any): void {
        this.price$.next(Number(goods.p));
        this.title$.next(goods.n);
        goods.f.s = goods.s;
        this.upload.patchValue({
            f: goods.f,
            additionalId: goods.id,
        });
        this.setWordCount(this.title$.value);
    }

    registerOnChange(fn: any): void {
        this.updata = fn;
        this.summeryData$ = combineLatest([
            this.price$,
            this.title$,
            this.upload.valueChanges,
        ]).pipe(
            map((x) => {
                return {
                    p: x[0],
                    n: x[1],
                    f: Reflect.get(x[2], 'f'),
                    id: Reflect.get(x[2], 'additionalId'),
                    s: -1,
                };
            })
        );

        this.summeryData$.subscribe((x) => {
            this.updata(x);
            this.validator(x);
        });
        validator(this.upload, this.upload.controls);
    }

    private validator(x: any) {
        if (x.p < 0 || isNaN(x.p)) {
            this.pError$.next(true);
        } else {
            this.pError$.next(false);
        }
        if (!x.n) {
            this.nError$.next(true);
        } else {
            this.nError$.next(false);
        }
    }

    registerOnTouched(fn: any): void {}

    freeClick() {
        if (this.isChecked) {
            this.resetPrice();
            this.re2.setAttribute(this.price.nativeElement, 'disabled', 'true');
        } else {
            this.resetPrice();
            this.re2.removeAttribute(this.price.nativeElement, 'disabled');
        }
    }

    private resetPrice() {
        this.price$.next(0);
    }

    onPriceInput(e: InputEvent) {
        const element = e.target as HTMLInputElement;
        element.value = element.value.replace('.', '');
        if (element.value.length >= 7) {
            element.value = element.value.slice(0, element.value.length - 1);
        }
        this.get = Number(element.value) - Number(element.value) * Number(this.handlingRate);
        console.log(this.handlingRate);
        this.price$.next(Number(element.value));
    }

    onInput(e: Event) {
        const element = e.target as HTMLInputElement;
        const wordValue = element.value;
        this.title$.next(element.value);
        this.setWordCount(wordValue);
    }

    private setWordCount(wordValue: string) {
        this.wordCount = wordValue.length;
    }

    /**
     * @description 删除
     */
    Delete() {
        this.delete.emit(this.index);
    }
}
