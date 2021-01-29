import { ZipInstance, ZipDelegate, ZipRef, ZipFileRef } from './zip.instance';
import { createWorkerRpc } from '../rpc';
import { Injectable } from '@angular/core';

@Injectable()
export class CompressService {
	private zip_instance: ZipDelegate;

	constructor() {
		this.zip_instance =
			typeof Worker != 'undefined'
				? createWorkerRpc<ZipDelegate>(new Worker('./zip.instance.ts', { name: 'jszip', type: 'module' })).instance
				: new ZipInstance();
	}

	async zip(buffer: ArrayBuffer | Blob): Promise<ZipArchiveRef> {
		const zip = new ZipArchiveRef(this.zip_instance);
		await zip.load(buffer);
		return zip;
	}
}

export class ZipArchiveRef {
	private ref: ZipRef;
	private list: Array<ZipFileRef>;

	constructor(private zipInstance: ZipDelegate) {}
	async load(arraybuffer: ArrayBuffer | Blob): Promise<void> {
		this.ref = await this.zipInstance.open(arraybuffer);
		this.list = await this.zipInstance.list(this.ref);
	}

	async file(file: string): Promise<ArrayBuffer> {
		return await this.zipInstance.unzip(this.ref, file);
	}

	filter(predict: (value: ZipFileRef, index: number, array: Array<ZipFileRef>) => boolean): ZipFileRef[] {
		return this.list.filter(predict);
	}

	async dispose(): Promise<void> {
		await this.zipInstance.close(this.ref);
		this.zipInstance = null;
		this.list = null;
	}
}
