import { WorkerInstance, RpcAction, Host } from '../rpc';
import * as JSZip from 'jszip';

@Host()
export class ZipInstance extends WorkerInstance implements ZipDelegate {
	// object reference
	private refMap: Map<ZipRef, JSZip>;

	constructor() {
		super();
		this.refMap = new Map();
	}

	private _id = 0;
	private _generateId(): number {
		return this._id++;
	}

	@RpcAction()
	async open(arrayBuffer: ArrayBuffer): Promise<ZipRef> {
		const zip = new JSZip();
		await zip.loadAsync(arrayBuffer, {});
		const id = this._generateId();
		this.refMap.set(id, zip);
		return id;
	}

	@RpcAction()
	async list(ref: ZipRef): Promise<ZipFileRef[]> {
		if (!this.refMap.has(ref)) {
			throw new Error('');
		}
		const zip = this.refMap.get(ref);
		const ret: ZipFileRef[] = [];
		for (const value in zip.files) {
			if (value) {
				const file = zip.files[value];
				ret.push({
					name: value,
					dir: file.dir,
				});
			}
		}
		return ret;
	}

	@RpcAction(true)
	async unzip(ref: ZipRef, file: string): Promise<ArrayBuffer> {
		if (!this.refMap.has(ref)) {
			throw new Error('');
		}
		const files = Object.keys(this.refMap.get(ref).files);
		const buffer = await this.refMap.get(ref).files[files.find(_file => _file.includes(file))].async('arraybuffer', meta => {
			//
		});
		return buffer;
	}

	@RpcAction()
	async close(ref: ZipRef): Promise<void> {
		if (!this.refMap.has(ref)) {
			throw new Error('');
		}
		const zip = this.refMap.get(ref);
		this.refMap.delete(ref);
	}
}

export type ZipRef = number;
export interface ZipFileRef {
	name: string;
	dir: boolean;
}

export interface ZipDelegate {
	open(arraybuffer: ArrayBuffer | Blob, transfers?: Transferable[]): Promise<ZipRef>;
	close(ref: ZipRef): Promise<void>;
	list(ref: ZipRef): Promise<Array<ZipFileRef>>;
	unzip(ref: ZipRef, file: string): Promise<ArrayBuffer>;
}
