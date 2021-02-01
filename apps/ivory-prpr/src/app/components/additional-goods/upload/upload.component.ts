import {
    Component,
    ViewChild,
    ElementRef,
    Renderer2,
    Input,
} from '@angular/core';
import { Observable, of, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HttpClient, HttpParams, HttpEventType } from '@angular/common/http';
import { tap, map, subscribeOn, switchMap, filter } from 'rxjs/operators';
import { ModalService } from 'src/app/core/service/modals.service';
import { PopTip } from '../../pop-tip/pop-tip';
import { Process } from 'src/app/core/model/process';

export interface IvoUploadFile {
    uid: string;
    size?: number;
    name: string;
    filename?: string;
    lastModified?: string;
    lastModifiedDate?: Date;
    url?: string;
    originFileObj?: File;
    percent?: number;
    thumbUrl?: string;
    linkProps?: { download: string };
    type?: string;
}

@Component({
    selector: 'ivo-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.less'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: UploadComponent,
            multi: true,
        },
    ],
})
export class UploadComponent implements ControlValueAccessor {
    constructor(
        private re2: Renderer2,
        private http: HttpClient,
        private modal: ModalService
    ) {}

    @Input()
    set fileSize(value: number) {
        this._fileSzie = Number(value);
    }
    get fileSizeFriendly(): number {
        return this._fileSzie * 1024 * 1024;
    }
    private _fileSzie: number;
    @ViewChild('files', { static: false })
    filesInput: ElementRef;
    @ViewChild('scroll_body', { static: false })
    scrollBody: ElementRef;
    filters$: BehaviorSubject<File[]> = new BehaviorSubject<File[]>([]);
    token$: BehaviorSubject<any[]> = new BehaviorSubject(null);
    @Input() fileNumber: number;
    @Input() buttonWord = '';
    @Input() canUplaod = true;
    @Input() canDelete = false;
    progress = false;
    Process$: BehaviorSubject<Process> = new BehaviorSubject({
        success: false,
        progress: 0,
    });
    // 上传之前是否清空
    @Input() isResertBeforeUpload = false;

    updata: (o: any[]) => void;
    writeValue(files: any[]): void {
        const data = files.map((x) => {
            return new File([], x);
        });
        this.filters$.next(data);
    }

    registerOnChange(fn: any): void {
        this.updata = fn;
        // 订阅文件观察对象
        this.init();
    }

    private init() {
        this.filters$.subscribe((x: File[]) => {
            this.token$.next(
                x
                    .map((_: File) => Reflect.get(_, 'token'))
                    .filter((l) => Boolean(l))
            );
        });

        // 订阅token观察对象
        this.token$
            .pipe(
                tap((x) => {
                    if (this.updata) {
                        this.updata(x);
                    }
                })
            )
            .subscribe();
    }

    /**
     *
     * @param x 文件对象列表
     * @description 验证
     */
    private validator(x: File[]) {
        let size = 0;
        x.forEach((_: File) => {
            size = _.size + size;
        });
        if (size > this.fileSizeFriendly) {
            this.modal.open(PopTip, '仅支持200MB以内文件上传，给它减减肥吧～');
            return false;
        }
        return true;
    }

    registerOnTouched(fn: any): void {}

    setDisabledState?(isDisabled: boolean): void {}

    /**
     *
     * @param e 事件对象
     * @description 删除上传文件
     */
    delteFile(symbol: symbol) {
        let files;
        this.filters$
            .pipe(
                map((x) => x.filter((_) => Reflect.get(_, 'symbol') !== symbol))
            )
            .subscribe((x) => {
                files = x;
            });
        this.filters$.next(files);
    }

    /**
     *
     * @param fileList 文件列表
     * @description 文件上传
     */
    uploadFiles(fileList: FileList | File[]): void {
        this.upload(fileList);
    }

    /**
     * @description 上传文件
     * @param fileList 文件列表
     */
    private upload(fileList: any) {
        const file = [];
        // tslint:disable-next-line: forin
        for (const key in fileList) {
            if (isNaN(Number(key))) {
                continue;
            }
            file.push(fileList.item(Number(key)));
        }
        if (!this.validator(file.concat(this.filters$.getValue()))) {
            return;
        }
        this.progress = true;

        for (const files of fileList) {
            const form = new FormData();
            form.append('f', files);
            this.http
                .post('/api/v1/common/upload_file', form, {
                    reportProgress: true,
                    observe: 'events',
                })
                .pipe(
                    filter((s) => {
                        return (
                            s.type === HttpEventType.UploadProgress ||
                            s.type === HttpEventType.Response
                        );
                    }),
                    map((e) => {
                        this.setScroll();

                        if (e.type === HttpEventType.UploadProgress) {
                            this.Process$.next({
                                success: false,
                                progress: e.loaded / e.total,
                            });
                        } else if (e.type === HttpEventType.Response) {
                            if (e.ok) {
                                const { token } = e.body as {
                                    token: string;
                                    url: string;
                                };

                                this.Process$.next({
                                    success: true,
                                    progress: 1,
                                });
                                this.progress = false;
                                this.reset();
                                this.setFile(files, token);
                                this.filters$.next([
                                    ...this.filters$.value,
                                    files,
                                ]);
                            }
                        } else {
                            throw new Error('unexpected event type.');
                        }
                    })
                )
                .subscribe();
        }
    }

    private setScroll() {
        const elelment = this.scrollBody
            .nativeElement as HTMLDivElement;
        elelment.scrollTop = elelment.scrollHeight - elelment.clientHeight;
    }

    private reset() {
        this.Process$.next({
            success: false,
            progress: 0,
        });
    }

    private setFile(file: any, token: string) {
        Reflect.set(file, 'token', token);
        Reflect.set(file, 'symbol', Symbol());
    }

    onClick(e: Event) {
        (this.filesInput.nativeElement as HTMLInputElement).click();
        e.preventDefault();
    }

    /**
     * @description 文件发生改变
     * @param e 事件对象
     */
    onChange(e: Event): void {
        if (this.isResertBeforeUpload) {
            this.resertUpload();
            this.isResertBeforeUpload = false;
        }
        const hie = e.target as HTMLInputElement;
        this.uploadFiles(hie.files);
        hie.value = '';
    }

    private resertUpload() {
        this.filters$.next([]);
    }
}
