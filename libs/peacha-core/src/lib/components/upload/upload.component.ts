import { WalletBindPage } from './../../../../../../apps/ivory/src/app/pages/wallet/wallet-bind/wallet-bind.page';
import { Component, ViewChild, ElementRef, Renderer2, Input, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map, filter, takeUntil } from 'rxjs/operators';
import { PopTips } from '../pop-tips/pop-tips';
import { Process } from '../../core/model/process';
import { ModalService } from '../../core/service/modals.service';

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

interface  IFileData 
 {  
	 dataUrl?: string;
	 token:string;
	 url:string;
	 name:string
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
export class UploadComponent implements ControlValueAccessor, OnInit, OnDestroy {
	constructor(private re2: Renderer2, private http: HttpClient, private modal: ModalService) { }
	@Input() buttonWord = '';
	@Input() canUplaod = true;
	@Input() canDelete = false;
	@Input() uploadType = '*' ;
    @Input() isUploadButtonHidden = false;
	@Input() isResertBeforeUpload = false;
	@Input() set fileSize(value: number) {
		this._fileSzie = Number(value);
	}
	@ViewChild('files', { static: false })
	filesInput: ElementRef<HTMLInputElement>;
	@ViewChild('scroll_body', { static: false })
	scrollBody: ElementRef;
	files$: BehaviorSubject<IFileData[]> = new BehaviorSubject<[]>([]);
	url$: BehaviorSubject<string[]> = new BehaviorSubject([]);
	desctroy$ = new Subject<void>();
	fileNumber = 1;
	oldButtonWord = '';
	canUploadButtonDisabled = false;
	private _fileSzie: number;
	get fileSizeFriendly(): number {
		return this._fileSzie * 1024 * 1024;
	}
	progress = false;
	updata: (o: IFileData[]) => void;
	Process$: BehaviorSubject<Process> = new BehaviorSubject({
		success: false,
		progress: 0,
	});
	// 上传之前是否清空

	/**
    *  @description 验证策略对象
     */
	verify = {
		sizeVerify: (e: File) => {
			if (e.size > this._fileSzie) {
				this.modal.open(PopTips, ['容量超过限制大小，请重新上传']);
				return false;
			}
			return true;
		},

	};

   isCanUpload =()=>{
    if(this.files$.getValue().length === this.fileNumber){
		this.canUplaod = false;
		this.buttonWord = '下载文件';
    }else {
		this.canUplaod = true;
	    this.buttonWord = this.oldButtonWord;
	}
   }

	writeValue(files: IFileData[]): void {
		const data = files.map(x => {
			return {
				token: x.token || '',
				name: x.name,
				url: x.url || '',
			};
		});
		this.files$.next(data);
	}

	registerOnChange(fn): void {
		this.updata = fn;
	}

	registerOnTouched(/*isDisabled*/): void {
	}
	setDisabledState?(/*isDisabled*/): void {
	}

	/**
	 *
	 * @param e 事件对象
	 * @description 删除上传文件
	 */
	delteFile(symbol: symbol) {
		let files;
		this.files$.pipe(map(x => x.filter(_ => Reflect.get(_, 'symbol') !== symbol))).subscribe(x => {
			files = x;
		});
		this.files$.next(files);
        this.isCanUpload();
	}

	onClick(e: Event) {
		if(this.canUplaod){
			this.filesInput.nativeElement.click();
		    e.preventDefault();
		} else {
			window.open(this.files$.getValue()[0].url,'_blank');
		} 
	}

	/**
	 * @description 文件发生改变
	 * @param e 事件对象
	 */
	onChange(e: Event): void {
		const hie = e.target as HTMLInputElement;
		this.isCanUploadBeforeUpload(hie);
		if (this.isResertBeforeUpload) {
			this.resertUpload();
		}
		if (this.verify.sizeVerify(hie.files[0])) {
			this.upload(hie.files);
		}
		hie.value = '';
	}

	private isCanUploadBeforeUpload(hie: HTMLInputElement) {
		if (hie.files.length >= this.fileNumber) {
			this.canUplaod = false;
			this.buttonWord = '下载文件';
		}
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
			this.modal.open(PopTips, ['仅支持200MB以内文件上传，给它减减肥吧～', false]);
			return false;
		}
		return true;
	}

	/**
	 * @description 上传文件
	 * @param fileList 文件列表
	 */
	private upload(fileList: FileList) {
		const file = [];
		this.canUploadButtonDisabled = true;
		for (const key in fileList) {
			if (isNaN(Number(key))) {
				continue;
			}
			file.push(fileList.item(Number(key)));
		}
		if (!this.validator(file.concat(this.files$.getValue()))) {
			return;
		}
		this.progress = true;
		for (const files of Array.from(fileList)) {
			const form = new FormData();
			form.append('f', files);
			this.http
				.post('/common/upload_file', form, {
					reportProgress: true,
					observe: 'events',
				})
				.pipe(
					filter(s => {
						return s.type === HttpEventType.UploadProgress || s.type === HttpEventType.Response;
					}),
					map(e => {
						if (e.type === HttpEventType.UploadProgress) {
							this.Process$.next({
								success: false,
								progress: e.loaded / e.total,
							});
						} else if (e.type === HttpEventType.Response) {
							if (e.ok) {
								const { token, url } = e.body as {
									token: string;
									url: string;
								};
								this.Process$.next({
									success: true,
									progress: 1,
								});
								this.progress = false;
								this.resetProcess();
								this.files$.next([...this.files$.value,
									{
									 name:files.name,token,
									 url, 
								    }]);
							}
						} else {
							throw new Error('unexpected event type.');
						}
					})
				)
				.subscribe();
		}
	}

	private resetProcess() {
		this.Process$.next({
			success: false,
			progress: 0,
		});
	}

   private subscribeData() {
    this.files$.pipe(takeUntil(this.desctroy$)).subscribe((x) => {
	  this.updata?.call(this,x);
	  this.isCanUpload();
	  this.canUploadButtonDisabled = false;
    });
  }

	private resertUpload() {
		this.files$.next([]);
	}

	private setOldButtonWord() {
		this.oldButtonWord = this.buttonWord;
	}


  ngOnInit(): void {
	this.setOldButtonWord();
    this.subscribeData();
  }


  ngOnDestroy(): void {
      this.desctroy$.next();
      this.desctroy$.unsubscribe();
  }

}
