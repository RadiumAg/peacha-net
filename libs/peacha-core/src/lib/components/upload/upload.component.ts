import { Component, ViewChild, ElementRef, Renderer2, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { map, filter } from 'rxjs/operators';
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
	constructor(private re2: Renderer2, private http: HttpClient, private modal: ModalService) { }

	@Input() set fileSize(value: number) {
		this._fileSzie = Number(value);
	}

	get fileSizeFriendly(): number {
		return this._fileSzie * 1024 * 1024;
	}
	private _fileSzie: number;
	@ViewChild('files', { static: false })
	filesInput: ElementRef<HTMLInputElement>;
	@ViewChild('scroll_body', { static: false })
	scrollBody: ElementRef;
	filters$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	files$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	url$: BehaviorSubject<any[]> = new BehaviorSubject([]);
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

	updata: (o: any[]) => void;
	writeValue(files: any[]): void {
		const data = files.map(x => {
			return {
				token: x.token || '',
				name: x.name,
				url: x.url || '',
			};
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
			this.files$.next(
				x.length === 0
					? []
					: x
						.map((_: File) => {
							return {
								token: Reflect.get(_, 'token'),
								url: Reflect.get(_, 'url'),
								name: Reflect.get(_, 'name'),
							};
						})
						.filter(l => Boolean(l))
			);
		});
		const updata = this.updata;
		// 订阅token观察对象
		this.files$.subscribe(x => {
			this.updata(x);
		});
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

	registerOnTouched(/* fn: any */): void { }

	setDisabledState?(/* isDisabled: boolean */): void { }

	/**
	 *
	 * @param e 事件对象
	 * @description 删除上传文件
	 */
	delteFile(symbol: symbol) {
		let files;
		this.filters$.pipe(map(x => x.filter(_ => Reflect.get(_, 'symbol') !== symbol))).subscribe(x => {
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
				.post('/common/upload_file', form, {
					reportProgress: true,
					observe: 'events',
				})
				.pipe(
					filter(s => {
						return s.type === HttpEventType.UploadProgress || s.type === HttpEventType.Response;
					}),
					map(e => {
						this.setScroll();

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
								this.reset();
								this.setFile(files, token, files.name, url);
								this.filters$.next([...this.filters$.value, files]);
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
		const elelment = this.scrollBody.nativeElement as HTMLDivElement;
		elelment.scrollTop = elelment.scrollHeight - elelment.clientHeight;
	}

	private reset() {
		this.Process$.next({
			success: false,
			progress: 0,
		});
	}

	private setFile(file: any, token: string, fileName?: string, url?: string) {
		Reflect.set(file, 'token', token);
		Reflect.set(file, 'name', fileName);
		Reflect.set(file, 'symbol', Symbol());
		Reflect.set(file, 'url', url);
	}

	onClick(e: Event) {
		this.filesInput.nativeElement.click();
		e.preventDefault();
	}

	/**
	 * @description 文件发生改变
	 * @param e 事件对象
	 */
	onChange(e: Event): void {
		if (this.isResertBeforeUpload) {
			this.resertUpload();
		}
		const hie = e.target as HTMLInputElement;
		if (this.verify.sizeVerify(hie.files[0])) {
			this.uploadFiles(hie.files);
		}
		hie.value = '';
	}

	private resertUpload() {
		this.filters$.next([]);
	}
}
