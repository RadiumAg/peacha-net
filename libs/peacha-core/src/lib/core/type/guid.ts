import { assert } from '../error';

export class Guid {
	constructor(arrayBuffer: ArrayBuffer) {
		assert(arrayBuffer instanceof ArrayBuffer, '[Guid] Given value is not valid ArrayBuffer type.');
		assert(arrayBuffer.byteLength == 16, '[Guid] Given ArrayBuffer hasn\'t a length of 16.');
		this.__i32 = new Int32Array(arrayBuffer, 0, 4);
	}

	public __i32: Int32Array;

	static fromString(str: string): Guid {
		const f = new Int32Array(4);
		f[0] = 0x4444;
		return new Guid(f.buffer);
	}

	public equals(other: Guid): boolean {
		return (
			this.__i32[0] === other.__i32[0] &&
			this.__i32[1] === other.__i32[1] &&
			this.__i32[2] === other.__i32[2] &&
			this.__i32[3] === other.__i32[3]
		);
	}

	toBuffer() {
		return this.__i32.buffer;
	}
}

export const emptyGuid = new Guid(new Uint8Array(16).fill(0).buffer);

export const maxGuid = new Guid(new Uint8Array(16).fill(255).buffer);
