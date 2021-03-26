import { ControlValueAccessor,NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { Component,forwardRef,Input,OnDestroy,OnInit } from '@angular/core';
import { CommmonApiService,ModalService,Process } from '@peacha-core';
import { Subject,BehaviorSubject } from 'rxjs';
import { filter,map,takeUntil } from 'rxjs/operators';
import { PopTips } from '../pop-tips/pop-tips';


interface IFileItem {
  name: string;
  url?: string;
  token?: string;
  symbol?: symbol;
  Process$?: BehaviorSubject<Process>
}

@Component({
  selector: 'ivo-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.less'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileUploadComponent),
    multi: true,
  }]
})
export class FileUploadComponent implements OnDestroy,ControlValueAccessor,OnInit {
  constructor(
    private commmonApiService: CommmonApiService,
    private modal: ModalService
  ) { }

  @Input()
  acceptType = '*';
  @Input() set fileSize(value: number) {
    this._fileSzie = Number(value);
  }
  get fileSizeFriendly(): number {
    return this._fileSzie * 1024 * 1024;
  }
  file$: BehaviorSubject<IFileItem> = new BehaviorSubject(null);
  @Input() fileNumber: number;
  @Input() buttonWord = '';
  @Input() canUplaod = true;
  @Input() canDelete = false;
  @Input() isResertBeforeUpload = false;
  updata: (o: IFileItem) => void;
  distroy$ = new Subject<void>();
  _fileSzie: number;

  /**
 *  @description 验证策略对象
 */
  verify = {
    sizeVerify: (e: File) => {
      if (e.size > this._fileSzie) {
        this.modal.open(PopTips,['容量超过限制大小，请重新上传']);
        return false;
      }
      return true;
    },
  };


  writeValue(files: IFileItem): void {
    this.file$.next(files);
  }

  registerOnChange(fn: (o: IFileItem) => void): void {
    this.updata = fn;
  }

  registerOnTouched(/* fn: any */): void { }

  setDisabledState?(/* isDisabled: boolean */): void { }

  /**
   *
   * @param e 事件对象
   * @description 删除上传文件
   */
  delteFile() {
    this.file$.next(null);
  }

  /**
   * @description 文件发生改变
   * @param e 事件对象
   */
  onFileChange(e: Event): void {
    if (this.isResertBeforeUpload) {
      this.resertUpload();
    }
    const inputFile = e.target as HTMLInputElement;
    if (this.verify.sizeVerify(inputFile.files[0])) {
      this.upload(inputFile.files);
    }
    inputFile.value = '';
  }

  downloadFile(url: string) {
    window.open(url,'_blank')
  }

  ngOnDestroy(): void {
    this.distroy$.next();
    this.distroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.subscribeData();
  }

  private resertUpload() {
    this.file$.next(null);
  }

  private subscribeData() {
    this.file$.pipe(takeUntil(this.distroy$)).subscribe(x => {
      if (x && x.url) {
        this.updata?.call(this,{ name: x.name,token: x.token,url: x.url });
      }
    })
  }

  /**
   * @description 上传文件
   * @param fileList 文件列表
   */
  private upload(fileList: FileList) {
    for (const file of Array.from(fileList)) {
      const symbol = Symbol();
      this.file$.next({
        name: file.name,symbol,Process$: new BehaviorSubject({
          success: false,
          progress: 0,
        })
      });

      const form = new FormData();
      form.append('f',file);

      this.commmonApiService.uploadFile(form)
        .pipe(
          filter(s => {
            return s.type === HttpEventType.UploadProgress || s.type === HttpEventType.Response;
          }),
          map(e => {
            const fileObj = this.file$.getValue();
            if (e.type === HttpEventType.UploadProgress) {
              fileObj.Process$.next({
                success: false,
                progress: e.loaded / e.total,
              });

            } else if (e.type === HttpEventType.Response) {
              if (e.ok) {
                const { token,url } = e.body as {
                  token: string;
                  url: string;
                };

                fileObj.Process$.next({
                  success: true,
                  progress: 1,
                });

                this.file$.next({
                  ... this.file$.getValue(),
                  token,url
                });
              }
            } else {
              throw new Error('unexpected event type.');
            }
          })
        ).subscribe();
    }
  }

}
