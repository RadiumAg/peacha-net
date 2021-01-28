import {
  Component,
  forwardRef,
  ViewChild,
  ElementRef,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalService } from '../../core/service/modals.service';
import { PopTips } from '../pop-tips/pop-tips';
import { getFileType } from '../../core/commom/common';

@Component({
  selector: 'ivo-illustrate-upload',
  templateUrl: './illustrate-upload.component.html',
  styleUrls: ['./illustrate-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IllustrateUploadComponent),
      multi: true,
    },
  ],
})
export class IllustrateUploadComponent implements ControlValueAccessor {
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private message: NzMessageService,
    private modal: ModalService
  ) {
    this.init();
  }
  isSuccess$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private images$ = new BehaviorSubject<UploadImage[]>([]);
  // 限制大小 B
  @Input() maxSize = 20971520;
  @Input() maxCount = 5;
  @Input() allowType = ['png', 'jpg', 'gif'];
  @ViewChild('mask', { read: ElementRef })
  mask: ElementRef;
  get accept(): string {
    const result = [];
    this.allowType.forEach((x) => {
      x = x === 'jpg' ? 'jpeg' : x;
      result.push(`Image/${x}`);
    });
    return result.toString();
  }
  @ViewChild('uploadList', { read: ViewContainerRef })
  uploadList: ViewContainerRef;
  disabled = false;
  imageShow$ = this.images$;
  private fnChange: any;

  /**
   *  @description 验证策略对象
   */
  verify = {
    typeVerify: (fileType: string): boolean => {
      return this.allowType.includes(fileType) ? true : false;
    },
    sizeVerify: (e: File) => {
      if (e.size > this.maxSize) {
        this.modal.open(PopTips, ['容量超过限制大小，请重新上传']);
        return false;
      }
      return true;
    },
  };

  private init() {
    this.images$.subscribe((x) => {
      if (this.images$.getValue().length >= this.maxCount) {
        this.disabled = true;
        return;
      }
      if (this.disabled) {
        this.disabled = false;
      }
    });
  }

  dropFile(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (!this.verify.typeVerify(getFileType(file.name))) {
      this.message.error(`请上传${this.allowType.toString()}图片格式`);
      return;
    }
    this.startUploadImage(file);
    this.clearFileInput(event);
  }

  private clearFileInput(event: Event) {
    (event.target as HTMLInputElement).value = '';
  }

  startUploadImage(img: File) {
    if (!this.verify.sizeVerify(img)) {
      return;
    }
    const form = new FormData();
    form.append('f', img, img.name);
    const symbol = Symbol();
    const upload: UploadImage = {
      symbol,
      process$: this.http
        .post('/common/upload_file', form, {
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
            if (e.type === HttpEventType.UploadProgress) {
              return {
                success: false,
                progress: e.loaded / e.total,
              };
            } else if (e.type === HttpEventType.Response) {
              if (e.ok) {
                const ret = e.body as {
                  token: string;
                  url: string;
                };
                this.uploadSuccess(symbol, ret.token, ret.url);
                return {
                  success: true,
                  progress: 1,
                };
              }
              return {
                success: false,
                progress: 0,
              };
            } else {
              throw new Error('unexpected event type.');
            }
          })
        ),
      url: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(img)
      ) as string,
    };
    this.images$.next([...this.images$.value, upload]);
  }

  drag(e: DragEvent) {
    e.dataTransfer.setData('Text', (e.target as HTMLElement).parentElement.id);
  }

  drop(e: DragEvent) {
    e.preventDefault();
    const data = e.dataTransfer.getData('Text');
    const targetElement = (e.target as HTMLElement).parentElement.nextSibling;
    const moveElement = document.getElementById(data);

    const imageArray = this.images$.getValue();
    const moveObject = imageArray.find((x) => x.url === data);
    const moveIndex = imageArray.findIndex((x) => x.url === data);
    const targetIndex = imageArray.findIndex(
      (x) => x.url === (e.target as HTMLElement).parentElement.id
    );
    imageArray.splice(moveIndex, 1);
    imageArray.splice(targetIndex, 0, moveObject);
  }

  uploadSuccess(symbol: symbol, token: string, url: string) {
    const k = this.images$.value.find((s) => s.symbol === symbol);
    k.remote_token = token;
    k.url = url;
    this.images$.next(this.images$.value);
    this.fnChange(this.images$.getValue());
  }

  removeFile(symbol: symbol) {
    let res: UploadImage[];
    this.images$
      .pipe(
        map((x) =>
          x.filter((_) => {
            return _.symbol !== symbol;
          })
        )
      )
      .subscribe((x) => {
        res = x;
      })
      .unsubscribe();
    this.images$.next(res);
    this.fnChange(this.images$.getValue());
  }

  inputChange(e: InputEvent) {
    this.startUploadImage((e.target as HTMLInputElement).files?.item(0));
    this.clearFileInput(e);
  }

  writeValue(v: UploadToken[]) {
    // tslint:disable-next-line: no-unused-expression
    v &&
      this.images$.next(
        v.map((s) => {
          return {
            remote_token: s.remote_token,
            url: s.url,
            symbol: Symbol(),
            process$: of({
              success: true,
              progress: 1,
            }),
          };
        })
      );
  }

  registerOnChange(fn: any) {
    this.fnChange = fn;
  }

  registerOnTouched(fn: any) {}

  trackBy(index: number, f: UploadImage) {
    return f.symbol;
  }
}

type UploadImage = {
  // tslint:disable-next-line: ban-types
  symbol: Symbol;
  process$: Observable<UpladoProcess>;
} & UploadToken;

type UploadToken = {
  remote_token?: string;
  url?: string;
};

type UpladoProcess = {
  success: boolean;
  progress: number;
};
