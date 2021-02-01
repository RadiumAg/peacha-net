import { HttpClient } from '@angular/common/http';
import {
    Component,
    Renderer2,
    Input,
} from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    FormBuilder,
    FormArray,
} from '@angular/forms';
import { ApiSrevice } from 'src/app/core/service/api.service';
@Component({
    selector: 'ivo-additional-goods',
    templateUrl: './additional-goods.component.html',
    styleUrls: ['./additional-goods.component.less'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: AdditionalGoodsComponent,
            multi: true,
        },
    ],
})
export class AdditionalGoodsComponent implements ControlValueAccessor {
    isMany$: BehaviorSubject<boolean>;
    isOnly$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    $summmeryData: Subject<any> = new Subject();
    handlingRate$ = this.http.get<{ rate: number }>(this.api.userRate);
    noneDisabled = false;
    manyDisabled = false;
    singleDisabled = false;
    saleType = '0';
    canDelete = true;
    isResertBeforeUpload = false;
    buttonWord = '文件上传';
    @Input() ivoDisabled = true;
    @Input() canUpload = true;
    @Input() fileMaxCount = 5;
    canInputPrice = true;
    canInputTitle = true;

    get noneElement(): HTMLInputElement {
        return document.getElementById('none') as HTMLInputElement;
    }
    get manyElement(): HTMLInputElement {
        return document.getElementById('many') as HTMLInputElement;
    }
    get singleElement(): HTMLInputElement {
        return document.getElementById('single') as HTMLInputElement;
    }
    constructor(
        private api: ApiSrevice,
        private re2: Renderer2,
        private fb: FormBuilder,
        private http: HttpClient
    ) {
        this.isMany$ = new BehaviorSubject<boolean>(true);
    }

    form = this.fb.group({
        gl: this.fb.array([]),
    });

    updata: (o: object) => void;
    writeValue(obj: any[]): void {
        obj = obj.map?.((x) => {
            return {
                f: x.file_name_list,
                price: x.price,
                name: x.name,
                stock: x.max_stock,
                id: x.id,
            };
        });
        if (!obj?.length) {
            return;
        }
        this.setChecked(obj);
        this.setAdditional(obj);
    }

    /**
     *
     * @description 设置附加商品
     */
    private setAdditional(obj: any[]) {
        obj.forEach((value, index) => {
            this.AddAdditional(
                JSON.parse(
                    JSON.stringify({
                        p: value.price,
                        n: value.name,
                        f: value.f,
                        s: value.stock,
                        id: value.id,
                    })
                )
            );
        });
    }

    /**
     * @description 设置无限销售或者单次销售的细节
     */
    private setChecked(obj: any[]) {
        if (obj[0].stock === -1) {
            this.saleType = '2';
            this.singleDisabled = true;
            this.manyDisabled = true;
            this.noneDisabled = true;
            this.isMany$.next(true);
            this.canUpload = false;
            this.canDelete = false;
            this.canInputPrice = false;
            this.canInputTitle = false;
        } else if (obj[0].stock === 1) {
            this.saleType = '1';
            this.singleDisabled = true;
            this.manyDisabled = true;
            this.noneDisabled = true;
            this.isMany$.next(false);
            this.canUpload = true;
            this.canDelete = false;
            this.isResertBeforeUpload = true;
            this.buttonWord = '重新上传';
        }
    }

    registerOnChange(fn: any): void {
        this.updata = fn;
        // 订阅表单
        let summaryData = {
            gl: [],
            ss: 0,
        };
        combineLatest([this.isMany$, this.isOnly$]).subscribe((x) => {
            summaryData = {
                gl: [],
                ss: x[1] ? 0 : x[0] ? 2 : 1,
            };
            this.updata(summaryData);
        });

        this.form.valueChanges.subscribe((x) => {
            summaryData.gl = x.gl;
            // 设置库存
            this.setCount(summaryData);
            this.updata(summaryData);
        });
    }

    private setCount(summaryData: { gl: any[]; ss: number }) {
        if (!this.isMany$.value) {
            if (summaryData.gl[0]) {
                summaryData.gl[0].s = 1;
            }
        } else {
            if (summaryData.gl[0]) {
                for (const item of summaryData.gl) {
                    item.s = -1;
                }
            }
        }
    }

    registerOnTouched(fn: any): void {}

    setDisabledState?(isDisabled: boolean): void {}

    get gl() {
        return this.form.get('gl') as FormArray;
    }

    /**
     * @description 改变销售方式
     */
    set ChangeMany(value: string) {
        if (value === '0') {
            this.gl.clear();
            this.isMany$.next(false);
            this.isOnly$.next(true);
        } else if (value === '1') {
            this.gl.clear();
            this.isMany$.next(false);
            this.isOnly$.next(false);
            this.AddAdditional({});
        } else if (value === '2') {
            this.isMany$.next(true);
            this.isOnly$.next(false);
            this.gl.clear();
        }
    }

    get ChangeMany(): string {
        return this.saleType;
    }

    sumData(e: any) {}

    trackBy(index, item) {
        return item;
    }

    deleteAddid(e: any) {
        this.gl.removeAt(e);
    }

    /**
     * @description 添加额外商品
     */
    AddAdditional({ p = 0, n = '', f = [], id = '', s = 1 }) {
        if (this.gl.controls.length >= this.fileMaxCount) {
            return;
        }
        this.gl.push(
            this.fb.control({
                p,
                n,
                f,
                s,
                id,
            })
        );
    }
}
