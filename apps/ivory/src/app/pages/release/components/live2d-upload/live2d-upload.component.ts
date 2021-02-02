import { Component, forwardRef, ViewChild, ElementRef, HostListener, Input, EventEmitter, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { ModalService } from '@peacha-core';
import { CompressService, FileNotFoundError, HttpVirtualFileSystem, Live2dPreviewComponent, Live2dTransformData, ReadableVirtualFileSystem, ZipVFS } from '@peacha-studio-core';

import { PopTips } from '@peacha-core/components';

export enum Live2dLoadStatus {
	Not,
	Loading,
	Ok,
	Error,
}

export enum UploadStatus {
	Not,
	Loading,
	Ok,
	Error,
}

@Component({
	selector: 'ivo-live2d-upload',
	templateUrl: './live2d-upload.component.html',
	styleUrls: ['./live2d-upload.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => Live2dUploadComponent),
			multi: true,
		},
	],
})
export class Live2dUploadComponent implements ControlValueAccessor {
	constructor(private compress: CompressService, private http: HttpClient, private modal: ModalService) { }

	token: string;
	transformData: Live2dTransformData;

	@Input()
	isGood: boolean;

	@Input()
	defaultPath: string;
	live2dLoadStatus$ = new BehaviorSubject(Live2dLoadStatus.Not);
	error = '';
	uploadStatus$ = new BehaviorSubject(UploadStatus.Not);
	uploadProgress$ = new BehaviorSubject(0);
	file: File;
	fileType: 'zip' | 'opal';
	vfs: ReadableVirtualFileSystem;
	@Input()
	width = 1200;
	@Input()
	height = 600;

	@Output()
	transformDataUpdate = new EventEmitter<Live2dTransformData>();

	@ViewChild('filesMulti')
	filesMulti: ElementRef;

	@ViewChild(Live2dPreviewComponent)
	live2d: Live2dPreviewComponent;
	update: (token: string) => void = () => { };

	@HostListener('dragover', ['$event'])
	onDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	@HostListener('dragleave', ['$event'])
	onDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	@HostListener('drop', ['$event'])
	onDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (!this.file && this.uploadStatus$.value === UploadStatus.Not) {
			this.loadFile(event.dataTransfer.files[0]);
		}
	}

	saveTransformData() {
		this.transformDataUpdate.emit(this.live2d.getTransformData());
		this.modal.open(PopTips, ['位置参数保存成功!', false, 1]);
	}

	onFile() {
		this.loadFile(this.filesMulti.nativeElement.files[0]);
	}

	onLive2dLoadOk() {
		this.live2dLoadStatus$.next(Live2dLoadStatus.Ok);
	}

	onLive2dLoadError(e: Error) {
		this.live2dLoadStatus$.next(Live2dLoadStatus.Error);
		if (e instanceof FileNotFoundError) {
			this.error = e.message;
		} else {
			this.error = '加载错误，请检查文件内容！';
		}
	}

	async loadFile(file: File) {
		if (file.name.endsWith('.zip')) {
			this.file = file;
			this.fileType = 'zip';
			try {
				const zipRef = await this.compress.zip(this.file);
				this.vfs = new ZipVFS(zipRef);
				this.live2dLoadStatus$.next(Live2dLoadStatus.Loading);
			} catch (e) {
				this.live2dLoadStatus$.next(Live2dLoadStatus.Error);
			}
		}
	}

	async loadFileFromOpal(file: string, transformData: Live2dTransformData) {
		try {
			this.uploadStatus$.next(UploadStatus.Ok);
			this.fileType = 'opal';
			this.transformData = transformData;
			this.vfs = new HttpVirtualFileSystem(file);
			this.live2dLoadStatus$.next(Live2dLoadStatus.Loading);
		} catch (e) {
			this.live2dLoadStatus$.next(Live2dLoadStatus.Error);
		}
	}

	async upload() {
		this.uploadStatus$.next(UploadStatus.Loading);
		const formData = new FormData();
		formData.append('f', this.file, this.file.name);
		this.http
			.post('/common/upload_file', formData, {
				reportProgress: true,
				observe: 'events',
			})
			.pipe(
				filter(s => {
					return s.type == HttpEventType.UploadProgress || s.type == HttpEventType.Response;
				})
			)
			.subscribe({
				next: e => {
					if (e.type == HttpEventType.UploadProgress) {
						this.uploadProgress$.next((e.loaded / e.total) * 100);
					} else if (e.type == HttpEventType.Response) {
						if (e.ok) {
							const ret = e.body as {
								token: string;
								url: string;
							};
							this.token = ret.token;

							this.uploadStatus$.next(UploadStatus.Ok);
							this.update(this.token);
						}
					} else {
						this.uploadStatus$.next(UploadStatus.Error);
					}
				},
				error: () => {
					this.uploadStatus$.next(UploadStatus.Error);
				},
			});
	}

	resetLoadStatus() {
		this.file = null;
		if (this.vfs && this.fileType === 'zip') {
			(this.vfs as ZipVFS).release();
		}
		this.vfs = null;
		this.update('');
		this.transformDataUpdate.emit(null);
		this.token = '';
		this.uploadProgress$.next(0);
		this.uploadStatus$.next(UploadStatus.Not);
		this.live2dLoadStatus$.next(Live2dLoadStatus.Not);
	}

	writeValue(): void { }

	registerOnChange(fn: (token: string) => void): void {
		this.update = fn;
	}

	registerOnTouched(): void { }
}
